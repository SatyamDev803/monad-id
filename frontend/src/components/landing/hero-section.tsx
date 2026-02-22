"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { useAccount } from "wagmi";
import { ConnectButton } from "@/components/wallet/connect-button";
import { Badge } from "@/components/ui/badge";

export function HeroSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const { isConnected } = useAccount();

  return (
    <section
      ref={ref}
      className="relative flex min-h-screen items-center justify-center overflow-hidden pt-20"
    >
      {/* Subtle background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          style={{ y }}
          className="absolute inset-0"
        >
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(#0f172a 1px, transparent 1px), linear-gradient(90deg, #0f172a 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
          {/* Gradient orbs */}
          <div className="absolute -left-40 top-20 h-125 w-125 rounded-full bg-linear-to-br from-border/60 to-transparent blur-3xl" />
          <div className="absolute -right-40 bottom-20 h-100 w-100 rounded-full bg-linear-to-bl from-ring/20 to-transparent blur-3xl" />
        </motion.div>
      </div>

      <motion.div
        style={{ opacity }}
        className="relative z-10 mx-auto max-w-4xl px-6 text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge
            variant="secondary"
            className="mb-6 rounded-full px-4 py-1.5 text-xs font-medium"
          >
            Built on Monad Testnet
          </Badge>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl font-bold leading-[1.1] tracking-tight md:text-6xl lg:text-7xl"
        >
          Prove You&apos;re Human.
          <br />
          <span className="bg-linear-to-r from-muted-foreground to-ring bg-clip-text text-transparent">
            Stay Private.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground"
        >
          Zero-knowledge proof-of-humanity on Monad. Verify your identity
          without exposing personal data. Receive a non-transferable soulbound
          token as proof.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-10 flex items-center justify-center gap-4"
        >
          {isConnected ? (
            <Button asChild size="lg" className="rounded-full px-8 text-base">
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
            <Link href="/integrate">View Docs</Link>
          </Button>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55 }}
          className="mx-auto mt-20 flex max-w-lg items-center justify-center gap-12"
        >
          {[
            { value: "ZK", label: "Proof System" },
            { value: "SBT", label: "Token Standard" },
            { value: "<1s", label: "Verification" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
