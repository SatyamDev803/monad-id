import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // snarkjs and related ZK packages need special handling
  serverExternalPackages: ["snarkjs"],
  turbopack: {
    resolveAlias: {
      // Provide browser-compatible fallbacks for Node.js builtins used by snarkjs
      fs: { browser: "" },
      readline: { browser: "" },
      path: { browser: "" },
      crypto: { browser: "" },
    },
  },
};

export default nextConfig;
