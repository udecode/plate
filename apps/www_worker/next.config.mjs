import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
import { globSync } from 'glob';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ogStubPath = path.join(__dirname, 'src/lib/og-stub.ts');

const nextConfig = async (phase) => {
  const config = {
    typescript: {
      ignoreBuildErrors: true,
    },

    turbopack: {
      resolveAlias: {
        'next/dist/compiled/@vercel/og/index.edge.js': ogStubPath,
        'next/dist/compiled/@vercel/og/index.node.js': ogStubPath,
      },
    },
    experimental: {
      turbopackFileSystemCacheForDev: true,
    },
    productionBrowserSourceMaps: false,
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
        // Redirect old ?locale=cn URLs to /cn/* paths
        {
          destination: '/cn',
          has: [{ key: 'locale', type: 'query', value: 'cn' }],
          permanent: true,
          source: '/',
        },
        {
          destination: '/cn/docs/:path*',
          has: [{ key: 'locale', type: 'query', value: 'cn' }],
          permanent: true,
          source: '/docs/:path*',
        },
        {
          destination: '/cn/:path*',
          has: [{ key: 'locale', type: 'query', value: 'cn' }],
          permanent: true,
          source: '/:path*',
        },
      ];
    },
    webpack: (config) => {
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        'next/dist/compiled/@vercel/og/index.edge.js': ogStubPath,
        'next/dist/compiled/@vercel/og/index.node.js': ogStubPath,
      };
      return config;
    },

    // webpack: (config, { buildId, dev, isServer, webpack }) => {
    //   config.externals.push({
    //     shiki: 'shiki',
    //     typescript: 'typescript',
    //   });

    //   if (!isServer) {
    //     config.resolve.fallback = {
    //       ...config.resolve.fallback,
    //       crypto: require.resolve('crypto-browserify'),
    //       stream: require.resolve('stream-browserify'),
    //     };

    //     config.plugins.push(
    //       new webpack.ProvidePlugin({
    //         process: 'process/browser',
    //       }),
    //       new webpack.NormalModuleReplacementPlugin(
    //         /node:crypto/,
    //         (resource: any) => {
    //           resource.request = resource.request.replace(/^node:/, '');
    //         }
    //       )
    //     );
    //   }
    //   return config;
    // },
  };

  if (phase === 'phase-development-server') {
    const fs = await import('node:fs');

    const packageNames = globSync('../../packages/**/package.json')
      .map((file) => {
        try {
          const packageJson = JSON.parse(fs.readFileSync(file, 'utf8'));

          return packageJson.name;
        } catch (_error) {
          return null;
        }
      })
      .filter((pkg) => pkg?.startsWith('@udecode') || pkg?.includes('platejs'));

    config.transpilePackages = [
      ...(config.transpilePackages || []),
      ...packageNames,
    ];
  }

  return config;
};

export default nextConfig;

initOpenNextCloudflareForDev();
