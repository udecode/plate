/** @type {import('next').NextConfig} */
const nextConfig = {
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
