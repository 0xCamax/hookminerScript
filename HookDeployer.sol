// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HookDeployer {
    event HookDeployed(address addr);

    function deployHook(
        bytes calldata creationCode,
        bytes calldata constructorArgs,
        bytes32 salt,
        address expectedAddress
    ) external returns (address addr) {
        require(creationCode.length != 0, "Empty bytecode");
        bytes memory creationCodeWithArgs = abi.encodePacked(
            creationCode,
            constructorArgs
        );

        assembly {
            addr := create2(
                0,
                add(creationCodeWithArgs, 0x20),
                mload(creationCodeWithArgs),
                salt
            )
        }

        require(addr != address(0), "HookDeploy: Failed");
        require(
            addr == expectedAddress,
            "HookDeployer returned a wrong address"
        );

        emit HookDeployed(addr);
    }
}
