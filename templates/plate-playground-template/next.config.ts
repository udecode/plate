import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // TEMPLATE ONLY
  turbopack: { root: import.meta.dirname },
  reactCompiler: true,
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },

  // TEMPLATE ONLY
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
