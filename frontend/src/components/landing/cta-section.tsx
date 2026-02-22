"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAccount } from "wagmi";
import { ConnectButton } from "@/components/wallet/connect-button";

export function CTASection() {
  const { isConnected } = useAccount();

  return (
    <section className="py-24">
      <div className="mx-auto max-w-4xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl border border-border/50 bg-card p-12 text-center shadow-lg shadow-border/40 md:p-16"
        >
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Ready to get started?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            Verify your identity in under a minute. Or integrate MonadID into
            your dApp with a single contract call.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            {isConnected ? (
              <Button
                asChild
                size="lg"
                className="rounded-full px-8 text-base"
              >
                <Link href="/verify">Get Verified</Link>
              </Button>
            ) : (
              <ConnectButton />
            )}
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full px-8 text-base"
            >
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
