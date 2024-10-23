import type { NextConfig } from 'next';

import { globSync } from 'glob';

const nextConfig = async (phase: string) => {
  const config: NextConfig = {
    // https://nextjs.org/docs/basic-features/image-optimization#domains
    images: {
      remotePatterns: [
        {
          hostname: 'cdn.discordapp.com',
          protocol: 'https',
        },
        {
          hostname: 'lh3.googleusercontent.com',
          protocol: 'https',
        },
        {
          hostname: 'avatars.githubusercontent.com',
          protocol: 'https',
        },
        {
          hostname: 'images.unsplash.com',
          protocol: 'https',
        },
      ],
    },

    // Configure domains to allow for optimized image loading.
    // https://nextjs.org/docs/api-reference/next.config.js/react-strict-mod
    reactStrictMode: true,

    // typescript: {
    //   ignoreBuildErrors: true,
    // },
    // eslint: {
    //   ignoreDuringBuilds: true,
    // },

    serverExternalPackages: ['@prisma/client'],

    staticPageGenerationTimeout: 1200,

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

  if (phase === 'phase-development-server') {
    const fs = await import('node:fs');

    const packageNames = globSync('../../packages/**/package.json')
      .map((file: any) => {
        try {
          const packageJson = JSON.parse(fs.readFileSync(file, 'utf8'));

          return packageJson.name;
        } catch (error) {
          return null;
        }
      })
      .filter((pkg) => pkg?.startsWith('@udecode'));

    config.transpilePackages = packageNames;
  }

  return config;
};

export default nextConfig;
