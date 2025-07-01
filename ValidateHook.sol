// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

library ValidateHook {
    using ValidateHook for address;
    uint160 internal constant ALL_HOOK_MASK = uint160((1 << 14) - 1);

    uint160 internal constant BEFORE_INITIALIZE_FLAG = 1 << 13;
    uint160 internal constant AFTER_INITIALIZE_FLAG = 1 << 12;

    uint160 internal constant BEFORE_ADD_LIQUIDITY_FLAG = 1 << 11;
    uint160 internal constant AFTER_ADD_LIQUIDITY_FLAG = 1 << 10;

    uint160 internal constant BEFORE_REMOVE_LIQUIDITY_FLAG = 1 << 9;
    uint160 internal constant AFTER_REMOVE_LIQUIDITY_FLAG = 1 << 8;

    uint160 internal constant BEFORE_SWAP_FLAG = 1 << 7;
    uint160 internal constant AFTER_SWAP_FLAG = 1 << 6;

    uint160 internal constant BEFORE_DONATE_FLAG = 1 << 5;
    uint160 internal constant AFTER_DONATE_FLAG = 1 << 4;

    uint160 internal constant BEFORE_SWAP_RETURNS_DELTA_FLAG = 1 << 3;
    uint160 internal constant AFTER_SWAP_RETURNS_DELTA_FLAG = 1 << 2;
    uint160 internal constant AFTER_ADD_LIQUIDITY_RETURNS_DELTA_FLAG = 1 << 1;
    uint160 internal constant AFTER_REMOVE_LIQUIDITY_RETURNS_DELTA_FLAG =
        1 << 0;

    struct Permissions {
        bool beforeInitialize;
        bool afterInitialize;
        bool beforeAddLiquidity;
        bool afterAddLiquidity;
        bool beforeRemoveLiquidity;
        bool afterRemoveLiquidity;
        bool beforeSwap;
        bool afterSwap;
        bool beforeDonate;
        bool afterDonate;
        bool beforeSwapReturnDelta;
        bool afterSwapReturnDelta;
        bool afterAddLiquidityReturnDelta;
        bool afterRemoveLiquidityReturnDelta;
    }

    function hasPermission(
        address hook,
        uint160 flag
    ) internal pure returns (bool) {
        return uint160(hook) & flag != 0;
    }

    /// @notice Derives the active permissions from the encoded hook address
    /// @param hook The hook address encoded with permission flags
    /// @return permissions A Permissions struct with all active flags set accordingly
    function getPermissionsFromAddress(
        address hook
    ) internal pure returns (Permissions memory permissions) {
        permissions.beforeInitialize = hook.hasPermission(
            BEFORE_INITIALIZE_FLAG
        );
        permissions.afterInitialize = hook.hasPermission(AFTER_INITIALIZE_FLAG);
        permissions.beforeAddLiquidity = hook.hasPermission(
            BEFORE_ADD_LIQUIDITY_FLAG
        );
        permissions.afterAddLiquidity = hook.hasPermission(
            AFTER_ADD_LIQUIDITY_FLAG
        );
        permissions.beforeRemoveLiquidity = hook.hasPermission(
            BEFORE_REMOVE_LIQUIDITY_FLAG
        );
        permissions.afterRemoveLiquidity = hook.hasPermission(
            AFTER_REMOVE_LIQUIDITY_FLAG
        );
        permissions.beforeSwap = hook.hasPermission(BEFORE_SWAP_FLAG);
        permissions.afterSwap = hook.hasPermission(AFTER_SWAP_FLAG);
        permissions.beforeDonate = hook.hasPermission(BEFORE_DONATE_FLAG);
        permissions.afterDonate = hook.hasPermission(AFTER_DONATE_FLAG);
        permissions.beforeSwapReturnDelta = hook.hasPermission(
            BEFORE_SWAP_RETURNS_DELTA_FLAG
        );
        permissions.afterSwapReturnDelta = hook.hasPermission(
            AFTER_SWAP_RETURNS_DELTA_FLAG
        );
        permissions.afterAddLiquidityReturnDelta = hook.hasPermission(
            AFTER_ADD_LIQUIDITY_RETURNS_DELTA_FLAG
        );
        permissions.afterRemoveLiquidityReturnDelta = hook.hasPermission(
            AFTER_REMOVE_LIQUIDITY_RETURNS_DELTA_FLAG
        );
    }
}
