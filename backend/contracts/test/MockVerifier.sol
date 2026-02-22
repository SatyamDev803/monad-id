// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @notice Mock verifier for unit tests. Allows toggling verification result.
contract MockVerifier {
    bool public shouldVerify = true;

    function setShouldVerify(bool _val) external {
        shouldVerify = _val;
    }

    function verifyProof(
        uint[2] calldata,
        uint[2][2] calldata,
        uint[2] calldata,
        uint[2] calldata
    ) external view returns (bool) {
        return shouldVerify;
    }
}
