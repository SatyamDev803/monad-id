"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TokenDisplayProps {
  tokenId: bigint;
}

export function TokenDisplay({ tokenId }: TokenDisplayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
    >
      <Card className="border-border/50 bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">
            Monad Human Token
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-2xl font-bold">
                MHT #{tokenId.toString()}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                ERC-721 Soulbound Token
              </p>
            </div>
            <Badge variant="outline" className="border-primary/50 text-primary">
              Soulbound
            </Badge>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            This token is non-transferable and permanently bound to your wallet.
            It serves as on-chain proof of your verified human identity.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
