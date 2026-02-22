"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface VerifyStatusProps {
  isPending: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  hash?: `0x${string}`;
  error: Error | null;
  onReset: () => void;
}

export function VerifyStatus({
  isPending,
  isConfirming,
  isSuccess,
  hash,
  error,
  onReset,
}: VerifyStatusProps) {
  if (!isPending && !isConfirming && !isSuccess && !error) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mt-6"
    >
      <Card className="border-border/50 bg-card shadow-sm">
        <CardContent className="pt-6">
          {isPending && (
            <div className="flex items-center gap-3">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">
                Confirm the transaction in your wallet...
              </p>
            </div>
          )}

          {isConfirming && (
            <div className="flex items-center gap-3">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <div>
                <p className="text-sm font-medium">
                  Transaction submitted. Waiting for confirmation...
                </p>
                {hash && (
                  <a
                    href={`https://testnet.monadexplorer.com/tx/${hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground underline"
                  >
                    View on Explorer
                  </a>
                )}
              </div>
            </div>
          )}

          {isSuccess && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600">
                  ✓
                </div>
                <div>
                  <p className="font-medium">Verification Complete!</p>
                  <p className="text-sm text-muted-foreground">
                    Your Aadhaar identity has been verified via zero-knowledge proof
                    and a soulbound Monad Human Token has been minted to your wallet.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button asChild>
                  <Link href="/dashboard">View Dashboard</Link>
                </Button>
                {hash && (
                  <Button variant="outline" asChild>
                    <a
                      href={`https://testnet.monadexplorer.com/tx/${hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Transaction
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/20 text-destructive">
                  ✕
                </div>
                <div>
                  <p className="font-medium">Transaction Failed</p>
                  <p className="text-sm text-muted-foreground">
                    {error.message.includes("User rejected")
                      ? "You rejected the transaction in your wallet."
                      : error.message.slice(0, 200)}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={onReset}>
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
