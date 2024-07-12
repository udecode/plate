import { globSync } from 'glob';

const nextConfig = async (phase, { defaultConfig }) => {
  /** @type {import('next').NextConfig} */
  const config = {
    // Enable React strict mode.
    // Enable experimental features.
    experimental: {
      esmExternals: false,
      // Specify external packages that should be excluded from server-side rendering.
      // https://beta.nextjs.org/docs/api-reference/next-config#servercomponentsexternalpackages
      serverComponentsExternalPackages: ['@prisma/client'],
    },

    // Configure domains to allow for optimized image loading.
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

    // typescript: {
    //   ignoreBuildErrors: true,
    // },
    // eslint: {
    //   ignoreDuringBuilds: true,
    // },

    // https://nextjs.org/docs/api-reference/next.config.js/react-strict-mod
    reactStrictMode: true,

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

    const packageNames = new globSync('../../packages/**/package.json')
      .map((file) => {
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
