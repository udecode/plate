import fs from 'node:fs';
import path from 'node:path';
import { createMDX } from 'fumadocs-mdx/next';
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
  const jsEntry = path.join(dir, 'index.js');

  if (fs.existsSync(tsEntry)) return tsEntry;
  if (fs.existsSync(tsxEntry)) return tsxEntry;
  if (fs.existsSync(jsEntry)) return jsEntry;

  return null;
};

const addAliasEntries = (
  aliases: Record<string, string>,
  importPath: string,
  packageDir: string,
  rootDirName: 'dist' | 'src'
) => {
  const rootDir = path.join(packageDir, rootDirName);
  const rootEntry = getIndexEntry(rootDir);
  const reactEntry = getIndexEntry(path.join(rootDir, 'react'));
  const staticEntry = getIndexEntry(path.join(rootDir, 'static'));

  if (rootEntry) aliases[importPath] = toAppImportPath(rootEntry);
  if (reactEntry) aliases[`${importPath}/react`] = toAppImportPath(reactEntry);
  if (staticEntry) {
    aliases[`${importPath}/static`] = toAppImportPath(staticEntry);
  }
};

const buildWorkspaceAliases = (rootDirName: 'dist' | 'src') => {
  const aliases: Record<string, string> = {};

  addAliasEntries(
    aliases,
    'platejs',
    path.join(PACKAGES_ROOT, 'plate'),
    rootDirName
  );

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
          path.join(udecodeRoot, udecodeEntry.name),
          rootDirName
        );
      }

      continue;
    }

    addAliasEntries(
      aliases,
      `@platejs/${entry.name}`,
      path.join(PACKAGES_ROOT, entry.name),
      rootDirName
    );
  }

  return aliases;
};

const buildWorkspaceDevAliases = () => {
  const sourceAliases = buildWorkspaceAliases('src');
  const distAliases = buildWorkspaceAliases('dist');
  const docsSourceAlias: Record<string, string> = {};

  if (process.env.PLATE_WWW_DYNAMIC_DOCS === '1') {
    docsSourceAlias['collections/server'] = toAppImportPath(
      path.join(APP_ROOT, '.source-dev/dynamic.ts')
    );
  }

  if (process.env.PLATE_WWW_DEV_SOURCE === '1') {
    return {
      ...sourceAliases,
      ...docsSourceAlias,
    };
  }

  return {
    ...sourceAliases,
    ...distAliases,
    ...docsSourceAlias,
  };
};

const withMDX = createMDX({});

const nextConfig = async (_phase: string) => {
  const isDev = _phase === PHASE_DEVELOPMENT_SERVER;
  const config: NextConfig = {
    typescript: {
      ignoreBuildErrors: true,
    },

    experimental: {
      externalDir: isDev,
      // The OOM came from the docs/import graph, not Turbopack's dev cache itself.
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
      '/api/search': ['../../content/docs/**/*'],
      '/api/registry-source/[name]': ['./src/registry/**/*', './public/r/**/*'],
      '/blocks/slate-to-html': ['./public/tailwind.css'],
      '/cn/docs/[[...slug]]': ['./src/registry/**/*', './public/r/**/*'],
      '/docs/[[...slug]]': ['./src/registry/**/*', './public/r/**/*'],
      '/docs/examples/slate-to-html': ['./public/tailwind.css'],
      '/view/slate-to-html': ['./public/tailwind.css'],
    },
    reactCompiler: !isDev,
    // Configure domains to allow for optimized image loading.
    // https://nextjs.org/docs/api-reference/next.config.js/react-strict-mod
    reactStrictMode: true,

    staticPageGenerationTimeout: 1200,

    turbopack: isDev
      ? {
          resolveAlias: buildWorkspaceDevAliases(),
        }
      : undefined,

    transpilePackages: ['ts-morph'],

    async redirects() {
      return [
        {
          destination: '/docs/releases',
          permanent: true,
          source: '/docs/migration',
        },
        {
          destination: '/cn/docs/releases',
          permanent: true,
          source: '/cn/docs/migration',
        },
        {
          destination: '/docs/installation/plate-ui#sync-copied-files',
          permanent: true,
          source: '/docs/components/changelog',
        },
        {
          destination: '/cn/docs/installation/plate-ui',
          permanent: true,
          source: '/cn/docs/components/changelog',
        },
        {
          destination: '/docs',
          permanent: true,
          source: '/docs.mdx',
        },
        {
          destination: '/docs/:path*.md',
          permanent: true,
          source: '/docs/:path*.mdx',
        },
        {
          destination: '/cn/docs',
          permanent: true,
          source: '/cn/docs.mdx',
        },
        {
          destination: '/cn/docs/:path*.md',
          permanent: true,
          source: '/cn/docs/:path*.mdx',
        },
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
          source: '/:path((?!api|cn).*)',
        },
      ];
    },

    async rewrites() {
      return [
        {
          destination: '/llm',
          source: '/docs.md',
        },
        {
          destination: '/llm/:path*',
          source: '/docs/:path*.md',
        },
        {
          destination: '/cn/llm',
          source: '/cn/docs.md',
        },
        {
          destination: '/cn/llm/:path*',
          source: '/cn/docs/:path*.md',
        },
        {
          destination: '/init/md',
          source: '/init.md',
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

  return withMDX(config);
};

export default nextConfig;
