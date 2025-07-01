import { HookFlag } from './constants.ts';

export function encodeFlags(flags: HookFlag[]): bigint {
	return flags.reduce((acc, flag) => acc | (1n << BigInt(flag)), 0n);
}


