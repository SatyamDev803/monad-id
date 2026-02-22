import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Integrate — MonadID",
  description:
    "Add human verification to your dApp with a single contract call. Code examples in Solidity, viem, and ethers.js.",
};

export default function IntegrateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
