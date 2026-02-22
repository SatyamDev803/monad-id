"use client";

import { motion } from "framer-motion";

const steps = [
  {
    step: 1,
    title: "Connect Wallet",
    description:
      "Connect your MetaMask or any EVM-compatible wallet to Monad testnet.",
  },
  {
    step: 2,
    title: "Scan Aadhaar QR Code",
    description:
      "Scan the QR code on your Aadhaar card, mAadhaar app, or e-Aadhaar PDF. The UIDAI digital signature is verified locally — your data never leaves your device.",
  },
  {
    step: 3,
    title: "Generate ZK Proof",
    description:
      "A zero-knowledge proof is generated client-side, verifying your identity and age without revealing any personal information.",
  },
  {
    step: 4,
    title: "Receive Your SBT",
    description:
      "On verification, a non-transferable Monad Human Token is minted to your wallet — proof you're a unique, verified human.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-t border-border/50 bg-card py-24">
      <div className="mx-auto max-w-4xl px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center text-3xl font-bold tracking-tight md:text-4xl"
        >
          How It Works
        </motion.h2>

        <div className="relative mt-16">
          <div className="absolute left-5.5 top-0 hidden h-full w-px bg-border md:block" />

          <div className="space-y-12">
            {steps.map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex gap-6"
              >
                <div className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-card font-mono text-sm font-semibold text-foreground shadow-sm">
                  {s.step}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{s.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {s.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
