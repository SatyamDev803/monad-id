"use client";

import { motion } from "framer-motion";
import { useAccount, useConnect } from "wagmi";
import { useSubscription } from "@/hooks/use-subscription";
import { PricingCard } from "@/components/pricing/pricing-card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";

const tiers = [
  {
    name: "Free",
    price: "0 MON",
    period: "",
    features: [
      "100 verifications per month",
      "Basic isHuman() checks",
      "Community support",
      "Monad testnet access",
    ],
  },
  {
    name: "Pro",
    price: "100 MON",
    period: "/month",
    features: [
      "10,000 verifications per month",
      "All view functions (isHuman, isOver18, isUnique)",
      "Priority support",
      "Dashboard analytics",
    ],
  },
  {
    name: "Enterprise",
    price: "1,000 MON",
    period: "/month",
    features: [
      "Unlimited verifications",
      "All view functions + custom queries",
      "Dedicated support & SLA",
      "Custom integration assistance",
    ],
  },
];

const faqs = [
  {
    question: "What's included in each plan?",
    answer:
      "All plans include access to the MonadID smart contract for verifying human identities. The Free plan gives you 100 verification calls per month. Pro unlocks all view functions with 10,000 calls. Enterprise provides unlimited access with dedicated support.",
  },
  {
    question: "How do I integrate MonadID?",
    answer:
      "Integration is simple — just call our smart contract's view functions (isHuman, isOver18, isUnique) from your own contracts or frontend. Check the Integrate page for code examples in Solidity, viem, and ethers.js.",
  },
  {
    question: "Can I upgrade my plan?",
    answer:
      "Yes! You can upgrade at any time by subscribing to a higher tier. Your new plan starts immediately and lasts for 30 days from the subscription date.",
  },
  {
    question: "How does payment work?",
    answer:
      "Payments are made on-chain in MON (Monad's native token). When you click Subscribe, your wallet will prompt you to send the tier price directly to the MonadIDSubscription smart contract. No intermediaries.",
  },
  {
    question: "What happens when my subscription expires?",
    answer:
      "Your verification calls will be limited to the Free tier limits. You can renew at any time to restore your subscription benefits. Your identity verification remains valid regardless of subscription status.",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

export default function PricingPage() {
  const { isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const {
    tier: currentTier,
    subscribe,
    isPending,
    isConfirming,
    isSuccess,
    hash,
    error,
    reset,
  } = useSubscription();

  const handleConnect = () => {
    const connector = connectors[0];
    if (connector) connect({ connector });
  };

  return (
    <section className="pt-28 pb-16">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold md:text-5xl">
            Choose Your Plan
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Simple, transparent pricing. Pay on-chain with MON. No credit cards,
            no middlemen.
          </p>
        </motion.div>

        {isSuccess && hash && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <Alert>
              <AlertDescription className="flex items-center justify-between">
                <span>
                  Subscription activated! Your plan is now active for 30 days.
                </span>
                <a
                  href={`https://testnet.monadexplorer.com/tx/${hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm underline"
                >
                  View Transaction
                </a>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <Alert variant="destructive">
              <AlertDescription className="flex items-center justify-between">
                <span>
                  {error.message.includes("User rejected")
                    ? "Transaction rejected."
                    : "Transaction failed. Please try again."}
                </span>
                <button
                  onClick={reset}
                  className="text-sm underline"
                >
                  Dismiss
                </button>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="mt-16 grid gap-8 md:grid-cols-3"
        >
          {tiers.map((tier, index) => (
            <PricingCard
              key={tier.name}
              name={tier.name}
              price={tier.price}
              period={tier.period}
              features={tier.features}
              tierIndex={index}
              isCurrentPlan={isConnected && currentTier === index}
              isPopular={index === 1}
              onSubscribe={subscribe}
              isPending={isPending}
              isConfirming={isConfirming}
              isConnected={isConnected}
              onConnect={handleConnect}
            />
          ))}
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto mt-24 max-w-2xl"
        >
          <h2 className="mb-8 text-center text-3xl font-bold">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-sm">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
