import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Identity — MonadID",
  description:
    "Generate a zero-knowledge proof to verify you're a unique human on Monad. Your data never leaves your browser.",
};

export default function VerifyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
