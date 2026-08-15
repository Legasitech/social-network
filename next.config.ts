import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
    unoptimized: true,
  },
  // Avoid blocking deploy on ESLint module resolution quirks on Vercel
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Keep type checking on; we fixed the error
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
