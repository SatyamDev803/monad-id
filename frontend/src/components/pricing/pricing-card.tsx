"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PricingCardProps {
  name: string;
  price: string;
  period: string;
  features: string[];
  tierIndex: number;
  isCurrentPlan: boolean;
  isPopular?: boolean;
  onSubscribe: (tier: number) => void;
  isPending: boolean;
  isConfirming: boolean;
  isConnected: boolean;
  onConnect: () => void;
}

const item = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

export function PricingCard({
  name,
  price,
  period,
  features,
  tierIndex,
  isCurrentPlan,
  isPopular,
  onSubscribe,
  isPending,
  isConfirming,
  isConnected,
  onConnect,
}: PricingCardProps) {
  const isLoading = isPending || isConfirming;

  return (
    <motion.div variants={item}>
      <Card
        className={`relative h-full border-border/50 bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-border/40 ${
          isPopular
            ? "border-foreground/20 shadow-lg shadow-border/50"
            : ""
        } ${isCurrentPlan ? "ring-2 ring-foreground" : ""}`}
      >
        {isPopular && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge className="px-3 py-1">Most Popular</Badge>
          </div>
        )}
        {isCurrentPlan && (
          <div className="absolute -top-3 right-4">
            <Badge variant="outline" className="bg-background px-3 py-1">
              Current Plan
            </Badge>
          </div>
        )}

        <CardHeader className="pb-2">
          <CardTitle className="text-xl">{name}</CardTitle>
          <div className="mt-4">
            <span className="font-mono text-4xl font-bold">{price}</span>
            {period && (
              <span className="ml-1 text-sm text-muted-foreground">
                {period}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <ul className="mb-8 space-y-3">
            {features.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <span className="mt-0.5 text-primary">✓</span>
                {feature}
              </li>
            ))}
          </ul>

          {!isConnected ? (
            <Button
              className="w-full rounded-lg"
              variant={isPopular ? "default" : "outline"}
              onClick={onConnect}
            >
              Connect Wallet
            </Button>
          ) : isCurrentPlan ? (
            <Button className="w-full rounded-lg" variant="outline" disabled>
              Current Plan
            </Button>
          ) : (
            <Button
              className="w-full rounded-lg"
              variant={isPopular ? "default" : "outline"}
              onClick={() => onSubscribe(tierIndex)}
              disabled={isLoading}
            >
              {isLoading
                ? isPending
                  ? "Confirm in wallet..."
                  : "Confirming..."
                : tierIndex === 0
                  ? "Get Started"
                  : "Subscribe"}
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
