import 'https://deno.land/std@0.224.0/dotenv/load.ts';
import { bytes, address } from './types.ts';
import { HookMiner } from './HookMiner.ts';
import { HookFlag } from './constants.ts';
import { encodeFlags } from './utils.ts';
import { AbiCoder } from 'npm:ethers';

async function main() {
	const flags = encodeFlags([
		HookFlag.BEFORE_INITIALIZE,
	]);
	const saltStart = 0;
	const creationCode: bytes = '0x600060008060008055';
    const hasCostructorArgs = false;
	const constructorArgs: bytes | undefined = new AbiCoder().encode(["bytes"], ["0x"]) as bytes
    const deployerAddress: address = '0x7EF2e0048f5bAeDe046f6BF797943daF4ED8CB47';
	const rpcUrl = Deno.env.get('API');

	if (!rpcUrl) {
		console.error('Falta variable de entorno API.');
		Deno.exit(1);
	}

	await HookMiner.find(
		deployerAddress,
		flags,
		creationCode,
		hasCostructorArgs ? constructorArgs : undefined,
		saltStart
	);
}

if (import.meta.main) {
	main().catch((err) => {
		console.error('Error en ejecución:', err.message);
		Deno.exit(1);
	});
}
