import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Not needed in your project
  turbopack: { root: __dirname },
  reactCompiler: true,
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },

  async redirects() {
    return [
      {
        destination: '/editor',
        permanent: false,
        source: '/',
      },
    ];
  },
};

export default nextConfig;
