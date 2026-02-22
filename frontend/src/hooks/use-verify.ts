"use client";

import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from "wagmi";
import { CONTRACTS } from "@/config/contracts";
import type { AadhaarProofData } from "@/lib/aadhaar";
import {
  formatProofForContract,
  buildAadhaarPublicSignals,
} from "@/lib/aadhaar";

export function useVerify() {
  const { address } = useAccount();
  const {
    writeContract,
    data: hash,
    isPending,
    error,
    reset,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({ hash });

  /**
   * Submit an Aadhaar ZK proof to the IdentityRegistry contract.
   *
   * The proof comes from the anon-aadhaar SDK which verifies:
   * - UIDAI digital signature on the QR code
   * - Age ≥ 18
   * - Generates a unique nullifier (used as commitment hash)
   */
  const verifyWithAadhaar = (proofData: AadhaarProofData) => {
    if (!address) return;

    const { pA, pB, pC } = formatProofForContract(proofData.groth16Proof);
    const pubSignals = buildAadhaarPublicSignals(proofData.nullifier);

    writeContract({
      ...CONTRACTS.identityRegistry,
      functionName: "verifyAndRegister",
      args: [pA, pB, pC, pubSignals],
    });
  };

  return {
    verifyWithAadhaar,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
    reset,
  };
}
