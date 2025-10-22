import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Turbopack config - webpack yerine
  turbopack: {
    // İyzipay için gerekli ayarlar
    resolveAlias: {
      'iyzipay': 'iyzipay'
    }
  },
  // Serverless function configuration
  serverExternalPackages: ['iyzipay'],
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript errors during build (optional)
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
