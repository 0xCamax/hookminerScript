import { HookFlag } from './constants.ts';
import { address, bytes, bytes32 } from './types.ts';
import { solidityPacked, keccak256, toBeHex } from 'npm:ethers';
import { encodeFlags } from './utils.ts';

export class HookMiner {
	private static FLAG_MASK: number = 0x3fff;

	private static log(...args: string[]) {
		console.log(`[HookMiner]`, ...args);
	}

	private static computeAddress(
		deployer: address,
		salt: number,
		creationCode: bytes
	): address {
		const hash = keccak256(
			solidityPacked(
				['bytes1', 'address', 'uint256', 'bytes32'],
				['0xFF', deployer, salt, keccak256(creationCode)]
			)
		);
		const result = ('0x' + hash.slice(-40)) as address;
		return result;
	}

	private static async getCode(address: address): Promise<bytes> {
		try {
			const body = {
				jsonrpc: '2.0',
				method: 'eth_getCode',
				params: [address],
				id: crypto.randomUUID(),
			};

			const response = await fetch(Deno.env.get('API')!, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
			});

			const json = await response.json();

			if (json.error) {
				throw new Error(`[${json.error.code}] ${json.error.message}`);
			}

			return json.result as bytes;
		} catch (err) {
			this.log(`Error in getCode: ${(err as Error).message}`);
			throw err;
		}
	}

	private static encodeCreationCode(
		creationCode: bytes,
		constructorArgs: bytes | undefined
	): bytes {
		if (!constructorArgs) return creationCode;
		const encoded = solidityPacked(
			['bytes', 'bytes'],
			[creationCode, constructorArgs]
		) as bytes;
		return encoded;
	}

	private static matchesFlags(addr: address, flags: bigint): boolean {
		const match = (BigInt(addr) & BigInt(this.FLAG_MASK)) === flags;
		return match;
	}

	public static async find(
		deployer: address,
		flags: HookFlag[] | bigint,
		creationCode: bytes,
		constructorArgs: bytes | undefined,
		startSalt: number = 0
	): Promise<{ address: address; salt: bytes32 }> {
		try {
			const targetFlags = Array.isArray(flags) ? encodeFlags(flags) : flags;

			const fullCode = this.encodeCreationCode(creationCode, constructorArgs);

			let salt = startSalt;
			while (true) {
				const exceptions: address[] = [];
				const candidate = this.computeAddress(deployer, salt, fullCode);

				if (
					this.matchesFlags(candidate, targetFlags) &&
					!exceptions.includes(candidate)
				) {
					const code = await this.getCode(candidate);
					if (code.length <= 2) {
						const result = {
							address: candidate,
							salt: toBeHex(salt, 32) as bytes32,
						};
						this.log(
							`Found matching address: ${result.address} with salt: ${result.salt}`
						);
						return result;
					}
					exceptions.push(candidate);
				}

				salt++;
			}
		} catch (err) {
			this.log(`Failed to find valid salt: ${(err as Error).message}`);
			throw err;
		}
	}
}
