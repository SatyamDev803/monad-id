"use client";

import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from "wagmi";
import { parseEther } from "viem";
import { CONTRACTS } from "@/config/contracts";

const TIER_PRICES: Record<number, bigint> = {
  0: 0n,
  1: parseEther("100"),
  2: parseEther("1000"),
};

const TIER_NAMES = ["Free", "Pro", "Enterprise"] as const;

export function useSubscription() {
  const { address } = useAccount();

  const { data: subscription, isLoading, refetch } = useReadContract({
    ...CONTRACTS.subscription,
    functionName: "getSubscription",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: isActive } = useReadContract({
    ...CONTRACTS.subscription,
    functionName: "isActive",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const {
    writeContract,
    data: hash,
    isPending,
    error,
    reset,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({ hash });

  const subscribe = (tier: number) => {
    writeContract({
      ...CONTRACTS.subscription,
      functionName: "subscribe",
      args: [tier],
      value: TIER_PRICES[tier] ?? 0n,
    });
  };

  const renew = () => {
    if (!subscription) return;
    const tier = Number(subscription.tier);
    writeContract({
      ...CONTRACTS.subscription,
      functionName: "renew",
      value: TIER_PRICES[tier] ?? 0n,
    });
  };

  const sub = subscription as
    | {
        tier: number;
        expiresAt: bigint;
        verificationsUsed: bigint;
        verificationLimit: bigint;
      }
    | undefined;

  return {
    tier: sub ? Number(sub.tier) : -1,
    tierName: sub ? TIER_NAMES[Number(sub.tier)] ?? "Unknown" : "None",
    expiresAt: sub?.expiresAt ?? 0n,
    verificationsUsed: sub?.verificationsUsed ?? 0n,
    verificationLimit: sub?.verificationLimit ?? 0n,
    isActive: (isActive as boolean) ?? false,
    isLoading,
    subscribe,
    renew,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
    reset,
    refetch,
  };
}
