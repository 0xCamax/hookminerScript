export enum HookFlag {
	ALL_HOOK_MASK = 14,
	BEFORE_INITIALIZE = 13,
	AFTER_INITIALIZE = 12,
	BEFORE_ADD_LIQUIDITY = 11,
	AFTER_ADD_LIQUIDITY = 10,
	BEFORE_REMOVE_LIQUIDITY = 9,
	AFTER_REMOVE_LIQUIDITY = 8,
	BEFORE_SWAP = 7,
	AFTER_SWAP = 6,
	BEFORE_DONATE = 5,
	AFTER_DONATE = 4,
	BEFORE_SWAP_RETURNS_DELTA = 3,
	AFTER_SWAP_RETURNS_DELTA = 2,
	AFTER_ADD_LIQUIDITY_RETURNS_DELTA = 1,
	AFTER_REMOVE_LIQUIDITY_RETURNS_DELTA = 0,
}

/**
 * Mapa de nombre de función a su selector de 4 bytes
 */
const hookSelectors = {
	beforeInitialize: '0xdc98354e',
	afterInitialize: '0x6fe7e6eb',
	beforeAddLiquidity: '0x259982e5',
	afterAddLiquidity: '0x9f063efc',
	beforeRemoveLiquidity: '0x21d0ee70',
	afterRemoveLiquidity: '0x6c2bbe7e',
	beforeSwap: '0x575e24b4',
	afterSwap: '0x23570d03',
	beforeDonate: '0xb6a8b0fa',
	afterDonate: '0xe1b4af69',
} as const;

/**
 * Mapeo de HookFlag a su nombre de función (si aplica)
 */
const hookFlagToFunctionName: Record<
	HookFlag,
	keyof typeof hookSelectors | null
> = {
	[HookFlag.ALL_HOOK_MASK]: null,
	[HookFlag.BEFORE_INITIALIZE]: 'beforeInitialize',
	[HookFlag.AFTER_INITIALIZE]: 'afterInitialize',
	[HookFlag.BEFORE_ADD_LIQUIDITY]: 'beforeAddLiquidity',
	[HookFlag.AFTER_ADD_LIQUIDITY]: 'afterAddLiquidity',
	[HookFlag.BEFORE_REMOVE_LIQUIDITY]: 'beforeRemoveLiquidity',
	[HookFlag.AFTER_REMOVE_LIQUIDITY]: 'afterRemoveLiquidity',
	[HookFlag.BEFORE_SWAP]: 'beforeSwap',
	[HookFlag.AFTER_SWAP]: 'afterSwap',
	[HookFlag.BEFORE_DONATE]: 'beforeDonate',
	[HookFlag.AFTER_DONATE]: 'afterDonate',
	[HookFlag.BEFORE_SWAP_RETURNS_DELTA]: null,
	[HookFlag.AFTER_SWAP_RETURNS_DELTA]: null,
	[HookFlag.AFTER_ADD_LIQUIDITY_RETURNS_DELTA]: null,
	[HookFlag.AFTER_REMOVE_LIQUIDITY_RETURNS_DELTA]: null,
};

/**
 * Verifica si un bytecode incluye todos los selectores correspondientes a los flags
 */
export function verifyHooksInBytecode(bytecode: string): { found: HookFlag[] } {
	const normalizedBytecode = bytecode.replace(/^0x/, '').toLowerCase();

	const found: HookFlag[] = [];

	for (const [flag, functionName] of Object.entries(hookFlagToFunctionName)) {
		if (functionName === null) continue;

		const selector = hookSelectors[functionName]
			.replace(/^0x/, '')
			.toLowerCase();
		const flagValue = parseInt(flag) as HookFlag;

		if (normalizedBytecode.includes(selector)) {
			found.push(flagValue);
		}
	}

	return { found };
}
export function flagToString(flag: HookFlag): string {
	return (
		Object.entries(HookFlag).find(([_, v]) => v === flag)?.[0] ??
		`Unknown(${flag})`
	);
}

export function checkExtraFlags(
	found: HookFlag[],
	flags: HookFlag[]
): HookFlag[] {
	return found.filter((f) => !flags.includes(f));
}
/**
 * Verifica si un selector está presente en el bytecode
 */
export function hasSelectorInBytecode(
	bytecode: string,
	selector: string
): boolean {
	return bytecode
		.replace(/^0x/, '')
		.toLowerCase()
		.includes(selector.replace(/^0x/, '').toLowerCase());
}

/**
 * Codifica un conjunto de flags en una máscara de bits
 */
export function encodeFlags(flags: HookFlag[]): bigint {
	return flags.reduce((acc, flag) => acc | (1n << BigInt(flag)), 0n);
}
