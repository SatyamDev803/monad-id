import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Skip TypeScript errors from @anon-aadhaar SDK source files during build
  typescript: {
    ignoreBuildErrors: true,
  },
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
  // Webpack fallbacks for production build (Vercel)
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        readline: false,
        path: false,
        crypto: false,
      };
    }
    return config;
  },
};

export default nextConfig;
