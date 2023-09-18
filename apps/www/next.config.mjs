// import { createContentlayerPlugin } from 'next-contentlayer';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode.
  // https://nextjs.org/docs/api-reference/next.config.js/react-strict-mod
  reactStrictMode: true,
  transpilePackages: ['@udecode/*'],

  // Configure domains to allow for optimized image loading.
  // https://nextjs.org/docs/basic-features/image-optimization#domains
  images: {
    domains: [
      'cdn.discordapp.com',
      'lh3.googleusercontent.com',
      'avatars.githubusercontent.com',
    ],
  },

  // typescript: {
  //   ignoreBuildErrors: true,
  // },
  // eslint: {
  //   ignoreDuringBuilds: true,
  // },

  staticPageGenerationTimeout: 1200,

  // Enable experimental features.
  experimental: {
    esmExternals: false,
    serverActions: true,
    // Specify external packages that should be excluded from server-side rendering.
    // https://beta.nextjs.org/docs/api-reference/next-config#servercomponentsexternalpackages
    serverComponentsExternalPackages: ['@prisma/client'],
  },

  // redirects() {
  //   return [
  //     {
  //       source: '/components',
  //       destination: '/docs/components/accordion',
  //       permanent: true,
  //     },
  //     {
  //       source: '/docs/components',
  //       destination: '/docs/components/accordion',
  //       permanent: true,
  //     },
  //     {
  //       source: '/examples',
  //       destination: '/examples/dashboard',
  //       permanent: false,
  //     },
  //     {
  //       source: '/docs/primitives/:path*',
  //       destination: '/docs/components/:path*',
  //       permanent: true,
  //     },
  //     {
  //       source: '/figma',
  //       destination: '/docs/figma',
  //       permanent: true,
  //     },
  //     {
  //       source: '/docs/forms',
  //       destination: '/docs/forms/react-hook-form',
  //       permanent: false,
  //     },
  //   ];
  // },
};

// const withContentlayer = createContentlayerPlugin({
// Additional Contentlayer config options
// });

export default nextConfig;
