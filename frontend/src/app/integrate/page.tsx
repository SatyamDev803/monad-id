"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IntegrationTabs } from "@/components/integrate/integration-tabs";

const contracts = [
  {
    name: "IdentityRegistry",
    address: "0x2541a918E3274048b18e9841D6391b64CDdCC4b0",
    description: "Core contract for identity verification and ZK proof storage",
  },
  {
    name: "MonadHumanToken",
    address: "0xD19B625eE6199CE3824054832300cA26198f9A28",
    description: "ERC-721 soulbound token minted upon verification",
  },
  {
    name: "MonadIDSubscription",
    address: "0xEb935EA7Dd87d6C8097A5Fd73A73D43334C6FA69",
    description: "B2B subscription management with on-chain payments",
  },
];

export default function IntegratePage() {
  return (
    <section className="pt-28 pb-16">
      <div className="mx-auto max-w-4xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold md:text-5xl">
            Integrate MonadID
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Add human verification to your dApp with a single contract call. No
            SDKs, no APIs, no databases.
          </p>
        </motion.div>

        {/* Contract Addresses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-12"
        >
          <h2 className="mb-4 text-2xl font-bold">
            Contract Addresses
          </h2>
          <div className="space-y-3">
            {contracts.map((contract) => (
              <Card key={contract.name}>
                <CardContent className="flex items-center justify-between py-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-sm font-semibold">
                        {contract.name}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        Monad Testnet
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {contract.description}
                    </p>
                  </div>
                  <a
                    href={`https://testnet.monadexplorer.com/address/${contract.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {contract.address.slice(0, 6)}...
                    {contract.address.slice(-4)}
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Code Examples */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-12"
        >
          <h2 className="mb-4 text-2xl font-bold">Code Examples</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Choose your preferred language or framework. All examples show how to
            check if a wallet is verified.
          </p>
          <IntegrationTabs />
        </motion.div>

        {/* Available Functions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-12"
        >
          <h2 className="mb-4 text-2xl font-bold">
            Available Functions
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                name: "isHuman(address)",
                returns: "bool",
                description:
                  "Returns true if the wallet has completed identity verification.",
              },
              {
                name: "isOver18(address)",
                returns: "bool",
                description:
                  "Returns true if the wallet owner proved they are 18 or older.",
              },
              {
                name: "isUnique(address)",
                returns: "bool",
                description:
                  "Returns true if the wallet has a unique, non-duplicate identity commitment.",
              },
              {
                name: "getIdentity(address)",
                returns: "Identity",
                description:
                  "Returns the full identity struct: isHuman, isOver18, commitmentHash, tokenId, verifiedAt.",
              },
            ].map((fn) => (
              <Card key={fn.name}>
                <CardHeader className="pb-2">
                  <CardTitle className="font-mono text-sm">
                    {fn.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    {fn.description}
                  </p>
                  <p className="mt-2 font-mono text-xs text-primary">
                    returns {fn.returns}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
