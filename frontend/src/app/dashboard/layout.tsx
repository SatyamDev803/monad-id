import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — MonadID",
  description:
    "View your identity verification status, soulbound token, and subscription details on MonadID.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
