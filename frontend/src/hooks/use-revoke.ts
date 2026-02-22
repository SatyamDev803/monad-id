"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACTS } from "@/config/contracts";

export function useRevoke() {
  const {
    writeContract,
    data: hash,
    isPending,
    error,
    reset,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({ hash });

  const revoke = () => {
    writeContract({
      ...CONTRACTS.identityRegistry,
      functionName: "revokeIdentity",
    });
  };

  return { revoke, hash, isPending, isConfirming, isSuccess, error, reset };
}
