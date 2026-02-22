"use client";

import { useAccount } from "wagmi";
import { useIdentity } from "@/hooks/use-identity";
import { useRevoke } from "@/hooks/use-revoke";
import { useSubscription } from "@/hooks/use-subscription";
import { IdentityCard } from "@/components/dashboard/identity-card";
import { TokenDisplay } from "@/components/dashboard/token-display";
import { VerificationDetails } from "@/components/dashboard/verification-details";
import { RevokeDialog } from "@/components/dashboard/revoke-dialog";
import { ConnectButton } from "@/components/wallet/connect-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatTimestamp } from "@/lib/format";

export default function DashboardPage() {
  const { isConnected } = useAccount();
  const {
    isHuman,
    isOver18,
    isUnique,
    commitmentHash,
    tokenId,
    verifiedAt,
    isLoading,
  } = useIdentity();
  const {
    revoke,
    hash: revokeHash,
    isPending: revokePending,
    isConfirming: revokeConfirming,
    isSuccess: revokeSuccess,
    error: revokeError,
  } = useRevoke();
  const {
    tierName,
    expiresAt,
    verificationsUsed,
    verificationLimit,
    isActive,
  } = useSubscription();

  if (!isConnected) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="mx-auto max-w-md text-center">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold">
                Connect Your Wallet
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Connect your wallet to view your identity dashboard.
              </p>
              <div className="mt-6 flex justify-center">
                <ConnectButton />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isHuman) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="mx-auto max-w-md text-center">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold">Not Verified</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                You haven&apos;t verified your identity yet.
              </p>
              <Button asChild className="mt-6">
                <Link href="/verify">Get Verified</Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <section className="pt-28 pb-16">
      <div className="mx-auto max-w-3xl px-6">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 text-4xl font-bold"
        >
          Dashboard
        </motion.h1>

        <div className="space-y-6">
          <IdentityCard
            isHuman={isHuman}
            isOver18={isOver18}
            isUnique={isUnique}
          />

          <TokenDisplay tokenId={tokenId} />

          <VerificationDetails
            commitmentHash={commitmentHash}
            verifiedAt={verifiedAt}
          />

          {/* Subscription Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">
                  Subscription
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="font-mono text-lg font-semibold">
                        {tierName} Plan
                      </p>
                      <Badge variant={isActive ? "default" : "secondary"}>
                        {isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    {isActive && expiresAt > 0n && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        Expires: {formatTimestamp(expiresAt)}
                      </p>
                    )}
                    {isActive && verificationLimit > 0n && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        Verifications: {verificationsUsed.toString()} /{" "}
                        {verificationLimit.toString()}
                      </p>
                    )}
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/pricing">
                      {isActive ? "Manage Plan" : "View Plans"}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <RevokeDialog
            onRevoke={revoke}
            isPending={revokePending}
            isConfirming={revokeConfirming}
            isSuccess={revokeSuccess}
            hash={revokeHash}
            error={revokeError}
          />
        </div>
      </div>
    </section>
  );
}
