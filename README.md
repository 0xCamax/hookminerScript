# Hook Miner

A TypeScript/Deno project for mining contract addresses with specific flags using CREATE2 deployment pattern. This tool helps find deterministic contract addresses that match desired hook flags before deployment.

## Features

- **Address Mining**: Find contract addresses with specific flag patterns
- **Hook Flags**: Support for 14 different hook flags with bitwise operations
- **Solidity Deployer**: Comprehensive smart contract for safe deployment and validation
- **Flag Validation**: Built-in permission checking and address validation
- **Human-Readable Permissions**: Easy-to-use permission getter functions

## Prerequisites

- [Deno](https://deno.land/) runtime
- Access to an Ethereum-compatible RPC endpoint
- Basic understanding of CREATE2 deployment pattern

## Installation

1. Clone the repository:

```bash
git clone https://github.com/0xCamax/hookminerScript
cd hookminerScript
```

2. Create a `.env` file in the project root:

```env
API=https://your-rpc-endpoint-url
```

## Usage

### Basic Example

```typescript
import { HookMiner } from './HookMiner.ts';
import { HookFlag } from './constants.ts';
import { encodeFlags } from './utils.ts';

// Define your parameters
const flags = encodeFlags([HookFlag.BEFORE_INITIALIZE]);
const creationCode = '0x600060008060008055'; // Your contract bytecode
const deployerAddress = '0x7EF2e0048f5bAeDe046f6BF797943daF4ED8CB47'; // Your HookDeployer address

// Find a suitable address and salt
const result = await HookMiner.find(
	deployerAddress,
	flags,
	creationCode,
	undefined, // No constructor args
	0 // Start salt
);

console.log(`Address: ${result.address}`);
console.log(`Salt: ${result.salt}`);
```

### With Constructor Arguments

```typescript
import { AbiCoder } from 'npm:ethers';

const constructorArgs = new AbiCoder().encode(
	['address', 'uint256'],
	['0x123...', 42]
);

const result = await HookMiner.find(
	deployerAddress,
	flags,
	creationCode,
	constructorArgs,
	0
);
```

### Running the Example

```bash
deno task mine
```

## API Reference

### HookMiner

#### `find(deployer, flags, creationCode, constructorArgs?, startSalt?)`

Finds a contract address that matches the specified flags.

**Parameters:**

- `deployer` (address): The deployer contract address
- `flags` (HookFlag[] | bigint): Target flags to match
- `creationCode` (bytes): Contract creation bytecode
- `constructorArgs` (bytes, optional): Encoded constructor arguments
- `startSalt` (number, optional): Starting salt value (default: 0)

**Returns:**

- `Promise<{address: address, salt: bytes32}>`: The matching address and salt

### HookDeployer Contract

Smart contract for deploying hooks with CREATE2 and comprehensive validation:

#### Core Deployment Functions

```solidity
function deployHook(
    bytes calldata creationCode,
    bytes calldata constructorArgs,
    bytes32 salt
) public returns (address addr)
```

```solidity
function safeDeploy(
    bytes calldata creationCode,
    bytes calldata constructorArgs,
    bytes32 salt,
    address expectedAddress,
    uint160[] calldata flags
) external returns (address addr)
```

#### Validation Functions

```solidity
function validateHookAddress(
    address expectedAddress,
    uint160[] calldata flags
) public pure
```

```solidity
function hasPermission(address hook, uint160 flag) public pure returns (bool)
```

#### Off-Chain Helper Functions

These functions are designed for development and testing purposes, allowing developers to inspect and validate addresses off-chain:

```solidity
function getPermissions(address hook) external pure returns (
    bool beforeInitialize,
    bool afterInitialize,
    bool beforeAddLiquidity,
    bool afterAddLiquidity,
    bool beforeRemoveLiquidity,
    bool afterRemoveLiquidity,
    bool beforeSwap,
    bool afterSwap,
    bool beforeDonate,
    bool afterDonate,
    bool beforeSwapReturnDelta,
    bool afterSwapReturnDelta,
    bool afterAddLiquidityReturnDelta,
    bool afterRemoveLiquidityReturnDelta
)
```

```solidity
function getFlag(string memory name) external pure returns (uint160)
```

## Environment Variables

- `API`: RPC endpoint URL for blockchain interaction


## Key Features of the Deployer

### Safe Deployment

The `safeDeploy` function provides additional safety by:

- Validating that the expected address has the required flags
- Ensuring the deployed address matches the expected address
- Reverting if validation fails


## Troubleshooting

### Common Issues

1. **RPC Errors**: Ensure your `API` environment variable is set correctly
2. **No Matching Address**: Try increasing the search range or adjusting flags
3. **Deployment Failures**: Verify the computed address matches expectations using `validateHookAddress`
4. **Missing Flags**: Use the `validateHookAddress` function to check required permissions before deployment
5. **Wrong Deployer** Check that the deployer address is your deployment or you could use any create2 public deployer.

### Off-Chain Development Helpers

The utility functions are designed for off-chain development and testing. Use them to inspect and validate addresses during development:

```javascript
// Check if address has specific flag (off-chain call)
const hasFlag = await deployer.hasPermission(targetAddress, flagValue);

// Get all permissions for an address (off-chain inspection)
const permissions = await deployer.getPermissions(targetAddress);
console.log('Before Initialize:', permissions.beforeInitialize);

// Get flag value by name (development helper)
const flagValue = await deployer.getFlag('BEFORE_INITIALIZE');
```

These functions provide human-readable outputs and are particularly useful for:

- Debugging during development
- Verifying mined addresses before deployment
- Understanding which permissions an address has
- Converting flag names to their numeric values

## Examples

See `main.ts` for a complete working example of the mining process, including flag validation and safe deployment.

---

**Note**: This tool is for development and testing purposes. Always verify results on testnets before mainnet deployment. Use the `safeDeploy` function for production deployments to ensure proper validation.
