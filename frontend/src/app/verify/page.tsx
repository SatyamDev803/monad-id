"use client";

import { useAccount } from "wagmi";
import { useIdentity } from "@/hooks/use-identity";
import { useVerify } from "@/hooks/use-verify";
import { AadhaarVerifyForm } from "@/components/verify/aadhaar-verify-form";
import { VerifyStatus } from "@/components/verify/verify-status";
import { ConnectButton } from "@/components/wallet/connect-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { motion } from "framer-motion";
import type { AadhaarProofData } from "@/lib/aadhaar";

export default function VerifyPage() {
  const { isConnected } = useAccount();
  const { isHuman, isLoading: identityLoading } = useIdentity();
  const {
    verifyWithAadhaar,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
    reset,
  } = useVerify();

  const handleProofGenerated = (proofData: AadhaarProofData) => {
    verifyWithAadhaar(proofData);
  };

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
                You need to connect your wallet to verify your identity.
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

  if (identityLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isHuman && !isSuccess) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="mx-auto max-w-md text-center">
            <CardContent className="pt-6">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-2xl text-green-600">
                ✓
              </div>
              <h2 className="text-2xl font-bold">
                Already Verified
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Your wallet is already verified as a unique human via Aadhaar.
              </p>
              <Button asChild className="mt-6">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <section className="pt-28 pb-16">
      <div className="mx-auto max-w-xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl font-bold">
            Verify Your Identity
          </h1>
          <p className="mt-3 text-muted-foreground">
            Scan your Aadhaar QR code to generate a zero-knowledge proof and
            verify you&apos;re a unique human on Monad.
          </p>
        </motion.div>

        <AadhaarVerifyForm
          onProofGenerated={handleProofGenerated}
          isPending={isPending}
        />

        <VerifyStatus
          isPending={isPending}
          isConfirming={isConfirming}
          isSuccess={isSuccess}
          hash={hash}
          error={error}
          onReset={reset}
        />
      </div>
    </section>
  );
}
