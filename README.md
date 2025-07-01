# Hook Miner

A TypeScript/Deno project for mining contract addresses with specific flags using CREATE2 deployment pattern. This tool helps find deterministic contract addresses that match desired hook flags before deployment.

## Features

- **Address Mining**: Find contract addresses with specific flag patterns
- **CREATE2 Support**: Uses CREATE2 deployment for deterministic address generation
- **Hook Flags**: Support for various hook flags (e.g., BEFORE_INITIALIZE)
- **Constructor Arguments**: Handle contracts with constructor parameters
- **RPC Integration**: Check existing code at computed addresses
- **Solidity Deployer**: Includes smart contract for actual deployment

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
const deployerAddress = '0x7EF2e0048f5bAeDe046f6BF797943daF4ED8CB47';

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
    ["address", "uint256"], 
    ["0x123...", 42]
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

Smart contract for deploying hooks with CREATE2:

```solidity
function deployHook(
    bytes calldata creationCode,
    bytes calldata constructorArgs,
    bytes32 salt,
    address expectedAddress
) external returns (address addr)
```

## Environment Variables

- `API`: RPC endpoint URL for blockchain interaction

## How It Works

1. **Flag Encoding**: Convert hook flags into a single bigint value
2. **Address Computation**: Use CREATE2 formula to compute potential addresses
3. **Flag Matching**: Check if computed address matches target flags
4. **Code Verification**: Verify the address is not already deployed
5. **Result**: Return the matching address and corresponding salt

The CREATE2 address formula:
```
address = keccak256(0xFF + deployer + salt + keccak256(creationCode))[12:]
```


### Common Issues

1. **RPC Errors**: Ensure your `API` environment variable is set correctly
2. **No Matching Address**: Try increasing the search range or adjusting flags
3. **Deployment Failures**: Verify the computed address matches expectations

### Debug Mode

Enable detailed logging by checking the console output from `HookMiner.log()` calls.

## Examples

See `main.ts` for a complete working example of the mining process.

---

**Note**: This tool is for development and testing purposes. Always verify results on testnets before mainnet deployment.