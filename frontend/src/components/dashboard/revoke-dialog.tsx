"use client";

import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RevokeDialogProps {
  onRevoke: () => void;
  isPending: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  hash?: `0x${string}`;
  error: Error | null;
}

export function RevokeDialog({
  onRevoke,
  isPending,
  isConfirming,
  isSuccess,
  hash,
  error,
}: RevokeDialogProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-xl text-destructive">
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isSuccess ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Your identity has been revoked and your Monad Human Token has
                been burned.
              </p>
              {hash && (
                <a
                  href={`https://testnet.monadexplorer.com/tx/${hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground underline"
                >
                  View Transaction
                </a>
              )}
            </div>
          ) : (
            <>
              <p className="mb-4 text-sm text-muted-foreground">
                Revoking your identity will burn your Monad Human Token and
                remove your verified status. Your commitment hash will remain
                used, meaning you cannot re-verify with the same identity.
              </p>

              {(isPending || isConfirming) && (
                <div className="mb-4 flex items-center gap-3">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-destructive border-t-transparent" />
                  <p className="text-sm text-muted-foreground">
                    {isPending
                      ? "Confirm in wallet..."
                      : "Waiting for confirmation..."}
                  </p>
                </div>
              )}

              {error && (
                <p className="mb-4 text-sm text-destructive">
                  {error.message.includes("User rejected")
                    ? "Transaction rejected."
                    : "Transaction failed."}
                </p>
              )}

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="destructive"
                    disabled={isPending || isConfirming}
                  >
                    Revoke Identity
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. Your identity will be
                      permanently revoked and your soulbound token will be
                      burned. You will not be able to re-register with the same
                      commitment.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="destructive" onClick={onRevoke}>
                      Yes, Revoke My Identity
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
