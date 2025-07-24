import type { NextConfig } from 'next';

import { createMDX } from 'fumadocs-mdx/next';
import { globSync } from 'glob';
const withMDX = createMDX();

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
    outputFileTracingIncludes: {
      '/api/registry/*': ['./src/registry/**/*'],
      '/blocks/slate-to-html': ['./public/tailwind.css'],
      '/docs/*': ['./src/registry/**/*'],
      '/docs/examples/slate-to-html': ['./public/tailwind.css'],
    },
    reactStrictMode: true,
    // Configure domains to allow for optimized image loading.
    // https://nextjs.org/docs/api-reference/next.config.js/react-strict-mod

    staticPageGenerationTimeout: 1200,

    transpilePackages: ['ts-morph'],

    // typescript: {
    //   ignoreBuildErrors: true,
    // },
    // eslint: {
    //   ignoreDuringBuilds: true,
    // },

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

    webpack: (config, { buildId, dev, isServer, webpack }) => {
      config.externals.push({
        shiki: 'shiki',
        typescript: 'typescript',
      });

      if (!isServer) {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          crypto: require.resolve('crypto-browserify'),
          stream: require.resolve('stream-browserify'),
        };

        config.plugins.push(
          new webpack.ProvidePlugin({
            process: 'process/browser',
          }),
          new webpack.NormalModuleReplacementPlugin(
            /node:crypto/,
            (resource: any) => {
              resource.request = resource.request.replace(/^node:/, '');
            }
          )
        );
      }
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
        } catch (error) {
          return null;
        }
      })
      .filter((pkg) => pkg?.startsWith('@udecode'));

    config.transpilePackages = [
      ...(config.transpilePackages || []),
      ...packageNames,
    ];
  }

  return withMDX(config);
};

export default nextConfig;
