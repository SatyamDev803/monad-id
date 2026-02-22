"use client";

import { useReadContracts, useAccount } from "wagmi";
import { CONTRACTS } from "@/config/contracts";

export function useIdentity() {
  const { address } = useAccount();

  const { data, isLoading, error, refetch } = useReadContracts({
    contracts: [
      {
        ...CONTRACTS.identityRegistry,
        functionName: "getIdentity",
        args: address ? [address] : undefined,
      },
      {
        ...CONTRACTS.monadHumanToken,
        functionName: "tokenOfOwner",
        args: address ? [address] : undefined,
      },
    ],
    query: { enabled: !!address },
  });

  const identity = data?.[0]?.result as
    | {
        isHuman: boolean;
        isOver18: boolean;
        commitmentHash: bigint;
        tokenId: bigint;
        verifiedAt: bigint;
      }
    | undefined;

  const tokenId = data?.[1]?.result as bigint | undefined;

  return {
    isHuman: identity?.isHuman ?? false,
    isOver18: identity?.isOver18 ?? false,
    isUnique: (identity?.commitmentHash ?? 0n) !== 0n,
    commitmentHash: identity?.commitmentHash ?? 0n,
    tokenId: tokenId ?? 0n,
    verifiedAt: identity?.verifiedAt ?? 0n,
    isLoading,
    error,
    refetch,
  };
}
