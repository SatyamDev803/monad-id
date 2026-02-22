"use client";

import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnonAadhaarProvider } from "@anon-aadhaar/react";
import { wagmiConfig } from "@/config/wagmi";
import { useState } from "react";

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AnonAadhaarProvider
          _appName="MonadID"
          _useTestAadhaar={true}
        >
          {children}
        </AnonAadhaarProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
