import fs from 'node:fs';
import path from 'node:path';
import type { NextConfig } from 'next';
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants';

const APP_ROOT = import.meta.dirname;
const REPO_ROOT = path.resolve(APP_ROOT, '../..');
const PACKAGES_ROOT = path.join(REPO_ROOT, 'packages');

const toAppImportPath = (targetPath: string) => {
  const relativePath = path
    .relative(APP_ROOT, targetPath)
    .replaceAll('\\', '/');

  return relativePath.startsWith('.') ? relativePath : `./${relativePath}`;
};

const getIndexEntry = (dir: string) => {
  const tsEntry = path.join(dir, 'index.ts');
  const tsxEntry = path.join(dir, 'index.tsx');

  if (fs.existsSync(tsEntry)) return tsEntry;
  if (fs.existsSync(tsxEntry)) return tsxEntry;

  return null;
};

const addAliasEntries = (
  aliases: Record<string, string>,
  importPath: string,
  packageDir: string
) => {
  const srcDir = path.join(packageDir, 'src');
  const rootEntry = getIndexEntry(srcDir);
  const reactEntry = getIndexEntry(path.join(srcDir, 'react'));
  const staticEntry = getIndexEntry(path.join(srcDir, 'static'));

  if (rootEntry) aliases[importPath] = toAppImportPath(rootEntry);
  if (reactEntry) aliases[`${importPath}/react`] = toAppImportPath(reactEntry);
  if (staticEntry) {
    aliases[`${importPath}/static`] = toAppImportPath(staticEntry);
  }
};

const buildWorkspaceSourceAliases = () => {
  const aliases: Record<string, string> = {};

  addAliasEntries(aliases, 'platejs', path.join(PACKAGES_ROOT, 'plate'));

  for (const entry of fs.readdirSync(PACKAGES_ROOT, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;

    if (entry.name === 'udecode') {
      const udecodeRoot = path.join(PACKAGES_ROOT, 'udecode');

      for (const udecodeEntry of fs.readdirSync(udecodeRoot, {
        withFileTypes: true,
      })) {
        if (!udecodeEntry.isDirectory()) continue;

        addAliasEntries(
          aliases,
          `@udecode/${udecodeEntry.name}`,
          path.join(udecodeRoot, udecodeEntry.name)
        );
      }

      continue;
    }

    addAliasEntries(
      aliases,
      `@platejs/${entry.name}`,
      path.join(PACKAGES_ROOT, entry.name)
    );
  }

  return aliases;
};

const nextConfig = async (_phase: string) => {
  const isDev = _phase === PHASE_DEVELOPMENT_SERVER;
  const config: NextConfig = {
    typescript: {
      ignoreBuildErrors: true,
    },

    experimental: {
      externalDir: isDev,
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
      '/api/registry/[name]': ['./src/registry/**/*', './public/r/**/*'],
      '/blocks/slate-to-html': ['./public/tailwind.css'],
      '/cn/docs/[[...slug]]': ['./src/registry/**/*', './public/r/**/*'],
      '/docs/[[...slug]]': ['./src/registry/**/*', './public/r/**/*'],
      '/docs/examples/slate-to-html': ['./public/tailwind.css'],
    },
    reactCompiler: !isDev,
    // Configure domains to allow for optimized image loading.
    // https://nextjs.org/docs/api-reference/next.config.js/react-strict-mod
    reactStrictMode: true,

    staticPageGenerationTimeout: 1200,

    turbopack: isDev
      ? {
          resolveAlias: buildWorkspaceSourceAliases(),
        }
      : undefined,

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

  return config;
};

export default nextConfig;
