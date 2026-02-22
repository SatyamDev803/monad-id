// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title Groth16Verifier (Mock)
/// @notice Mock verifier for MVP. Replace with snarkjs-generated verifier for production.
/// @dev Implements the same interface as a real Groth16 verifier so IdentityRegistry
///      works identically with both mock and real verifiers.
contract Groth16Verifier {
    function verifyProof(
        uint[2] calldata,
        uint[2][2] calldata,
        uint[2] calldata,
        uint[2] calldata
    ) external pure returns (bool) {
        return true;
    }
}
