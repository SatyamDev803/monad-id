import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/providers/web3-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/sonner";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MonadID — ZK Proof-of-Humanity on Monad",
  description:
    "Privacy-preserving identity verification for the Monad ecosystem. Prove you are human without revealing personal data.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-sans antialiased`}>
        <Web3Provider>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <Toaster />
        </Web3Provider>
      </body>
    </html>
  );
}
