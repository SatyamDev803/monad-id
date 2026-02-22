import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — MonadID",
  description:
    "Simple, transparent pricing for MonadID identity verification. Pay on-chain with MON. Free, Pro, and Enterprise plans.",
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
