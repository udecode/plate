/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        destination: '/editor',
        source: '/',
      },
    ];
  },
};

export default nextConfig;
