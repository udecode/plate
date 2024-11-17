/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/editor',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
