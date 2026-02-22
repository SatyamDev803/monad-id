/**
 * Aadhaar ZK Proof utilities
 *
 * Converts anon-aadhaar proof data into the format expected by
 * our IdentityRegistry smart contract (Groth16 pA/pB/pC + public signals).
 */

/**
 * Groth16 proof shape from snarkjs.
 * Defined locally to avoid importing snarkjs (heavy package).
 */
export interface Groth16Proof {
  pi_a: string[];
  pi_b: string[][];
  pi_c: string[];
  protocol: string;
  curve: string;
}

/**
 * Shape of the proof object stored inside anon-aadhaar's serialized PCD.
 * We only reference the fields we actually need.
 */
export interface AadhaarProofData {
  groth16Proof: Groth16Proof;
  nullifier: string;
  ageAbove18: string; // "1" or "0"
  timestamp: string;
  pubkeyHash: string;
  signalHash: string;
  gender: string;
  pincode: string;
  state: string;
}

/**
 * Convert a snarkjs Groth16Proof into the on-chain tuple format
 * (uint256[2], uint256[2][2], uint256[2]).
 */
export function formatProofForContract(groth16Proof: Groth16Proof) {
  const pA: [bigint, bigint] = [
    BigInt(groth16Proof.pi_a[0]),
    BigInt(groth16Proof.pi_a[1]),
  ];

  // Note: solidity expects pB in *reversed* inner-array order
  const pB: [[bigint, bigint], [bigint, bigint]] = [
    [BigInt(groth16Proof.pi_b[0][1]), BigInt(groth16Proof.pi_b[0][0])],
    [BigInt(groth16Proof.pi_b[1][1]), BigInt(groth16Proof.pi_b[1][0])],
  ];

  const pC: [bigint, bigint] = [
    BigInt(groth16Proof.pi_c[0]),
    BigInt(groth16Proof.pi_c[1]),
  ];

  return { pA, pB, pC };
}

/**
 * Build public signals for the IdentityRegistry contract.
 *
 * _pubSignals[0] = commitment hash  (we use the anon-aadhaar nullifier)
 * _pubSignals[1] = age threshold    (always 18)
 */
export function buildAadhaarPublicSignals(
  nullifier: string
): [bigint, bigint] {
  return [BigInt(nullifier), 18n];
}

/**
 * Validate that the anon-aadhaar proof confirms the user is ≥ 18.
 */
export function isAgeVerified(proof: AadhaarProofData): boolean {
  return proof.ageAbove18 === "1";
}

/**
 * Extract a human-readable summary from the proof for UI display.
 */
export function getProofSummary(proof: AadhaarProofData) {
  return {
    isOver18: proof.ageAbove18 === "1",
    gender: proof.gender !== "0" ? proof.gender : null,
    pincode: proof.pincode !== "0" ? proof.pincode : null,
    state: proof.state !== "0" ? proof.state : null,
    timestamp: new Date(Number(proof.timestamp) * 1000).toLocaleString(),
    nullifier: proof.nullifier,
  };
}
