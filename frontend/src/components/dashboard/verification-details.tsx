"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTimestamp, formatCommitment } from "@/lib/format";

interface VerificationDetailsProps {
  commitmentHash: bigint;
  verifiedAt: bigint;
}

export function VerificationDetails({
  commitmentHash,
  verifiedAt,
}: VerificationDetailsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <Card className="border-border/50 bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">
            Verification Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Commitment Hash</p>
            <p className="mt-1 break-all font-mono text-sm">
              {formatCommitment(commitmentHash)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Verified At</p>
            <p className="mt-1 text-sm">{formatTimestamp(verifiedAt)}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
