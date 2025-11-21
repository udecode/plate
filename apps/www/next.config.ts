/** biome-ignore-all lint/performance/useTopLevelRegex: lib */
import type { NextConfig } from 'next';

import { globSync } from 'glob';

const nextConfig = async (phase: string) => {
  const config: NextConfig = {
    experimental: {
      turbopackFileSystemCacheForDev: true,
    },

    typescript: { ignoreBuildErrors: true },

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
    outputFileTracingIncludes: {
      '/api/registry/*': ['./src/registry/**/*'],
      '/blocks/slate-to-html': ['./public/tailwind.css'],
      '/docs/*': ['./src/registry/**/*'],
      '/docs/examples/slate-to-html': ['./public/tailwind.css'],
    },
    // slower compilation, so let's disable it in development for now
    reactCompiler: true,
    // Configure domains to allow for optimized image loading.
    // https://nextjs.org/docs/api-reference/next.config.js/react-strict-mod
    reactStrictMode: true,

    staticPageGenerationTimeout: 1200,

    transpilePackages: ['ts-morph'],

    async redirects() {
      return [
        {
          destination: '/r/:path.json',
          permanent: true,
          source: '/r/:path([^.]*)',
        },
        {
          destination: '/rd/:path.json',
          permanent: true,
          source: '/rd/:path([^.]*)',
        },
      ];
    },

    rewrites: async () => {
      return [
        {
          destination: '/?locale=cn',
          source: '/cn',
        },
        {
          destination: '/:path*?locale=cn', // Rewrite it to the corresponding path without /cn
          source: '/cn/:path*', // Match any path under /cn
        },
      ];
    },

    webpack: (config) => {
      config.ignoreWarnings = [
        { module: /node_modules\/ts-morph/ },
        { module: /node_modules\/tsconfig-paths/ },
        { module: /node_modules\/cosmiconfig/ },
        { module: /node_modules\/@ts-morph/ },
      ];
      return config;
    },
  };

  if (phase === 'phase-development-server') {
    const fs = await import('node:fs');

    const packageNames = globSync('../../packages/**/package.json')
      .map((file: any) => {
        try {
          const packageJson = JSON.parse(fs.readFileSync(file, 'utf8'));

          return packageJson.name;
        } catch (_error) {
          return null;
        }
      })
      .filter(
        (pkg) =>
          pkg?.startsWith('@udecode') ||
          pkg?.startsWith('@platejs') ||
          pkg?.startsWith('platejs')
      );

    config.transpilePackages = [
      ...(config.transpilePackages || []),
      ...packageNames,
    ];
  }

  return config;
};

export default nextConfig;
