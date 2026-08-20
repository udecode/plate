import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
  reactCompiler: true,

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
  // TEMPLATE ONLY
  turbopack: { root: import.meta.dirname },
};

export default nextConfig;
