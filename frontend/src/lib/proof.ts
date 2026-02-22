/**
 * Proof utilities for MonadID
 *
 * This module is kept for backward compatibility and utility functions.
 * The primary proof generation now uses the anon-aadhaar SDK via @/lib/aadhaar.
 */

import { keccak256, encodePacked, type Address } from "viem";

/**
 * Generate a fallback commitment from user inputs.
 * Used only for testing / fallback scenarios.
 */
export function generateCommitment(
  address: Address,
  secret: string,
  age: number,
  country: string
): bigint {
  const packed = encodePacked(
    ["address", "string", "uint256", "string"],
    [address, secret, BigInt(age), country]
  );
  return BigInt(keccak256(packed));
}

/**
 * @deprecated Use anon-aadhaar SDK for real proofs.
 * Kept for testing with the mock verifier.
 */
export function generateDummyProof() {
  const pA: [bigint, bigint] = [1n, 2n];
  const pB: [[bigint, bigint], [bigint, bigint]] = [
    [1n, 2n],
    [3n, 4n],
  ];
  const pC: [bigint, bigint] = [1n, 2n];
  return { pA, pB, pC };
}

/**
 * @deprecated Use buildAadhaarPublicSignals from @/lib/aadhaar instead.
 */
export function buildPublicSignals(commitment: bigint): [bigint, bigint] {
  return [commitment, 18n];
}
