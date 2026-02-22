"use client";

import { useEffect, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Button } from "@/components/ui/button";
import { formatAddress } from "@/lib/format";

export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  // Prevent hydration mismatch — wallet state differs between server and client
  if (!mounted) {
    return (
      <Button className="rounded-full" disabled>
        Connect Wallet
      </Button>
    );
  }

  if (isConnected && address) {
    return (
      <Button
        variant="outline"
        onClick={() => disconnect()}
        className="rounded-full font-mono text-sm"
      >
        {formatAddress(address)}
      </Button>
    );
  }

  return (
    <Button
      onClick={() => connect({ connector: connectors[0] })}
      className="rounded-full"
    >
      Connect Wallet
    </Button>
  );
}
