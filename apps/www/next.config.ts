import fs from 'node:fs';
import path from 'node:path';

import { createMDX } from 'fumadocs-mdx/next';
import type { NextConfig } from 'next';
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants';

import { getWorkspaceSourceEntries } from '../../config/workspace-source-entries.mjs';
import docsRedirects from '../../docs/plite/reference/public-route-map.json';

const APP_ROOT = import.meta.dirname;
const REPO_ROOT = path.resolve(APP_ROOT, '../..');

const toAppImportPath = (targetPath: string) => {
  const relativePath = path
    .relative(APP_ROOT, targetPath)
    .replaceAll('\\', '/');

  return relativePath.startsWith('../') ? relativePath : `./${relativePath}`;
};

const isPliteMode = process.env.PLATE_WWW_PLITE === '1';

const buildWorkspaceAliases = (rootDirName: 'dist' | 'src') =>
  Object.fromEntries(
    getWorkspaceSourceEntries(REPO_ROOT).flatMap(
      ({ distEntry, sourceEntry, specifier }) => {
        const target = rootDirName === 'src' ? sourceEntry : distEntry;

        return fs.existsSync(target)
          ? [[specifier, toAppImportPath(target)]]
          : [];
      }
    )
  );

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
    ...distAliases,
    ...sourceAliases,
    ...docsSourceAlias,
  };
};

const withMDX = createMDX({
  outDir:
    process.env.PLATE_WWW_DYNAMIC_DOCS === '1' ? '.source-dev' : '.source',
});

const nextConfig = (_phase: string) => {
  const isDev = _phase === PHASE_DEVELOPMENT_SERVER;
  const config: NextConfig = {
    cacheComponents: true,
    distDir:
      process.env.PLATE_WWW_DIST_DIR ?? (isPliteMode ? '.next-plite' : '.next'),
    allowedDevOrigins: ['udecodes-mac-studio.tail49dee1.ts.net'],
    typescript: {
      ignoreBuildErrors: true,
    },

    experimental: {
      externalDir: isDev,
      instantInsights: {
        validationLevel: 'manual-warning',
      },
      ...(process.env.PLATE_WWW_WEBPACK
        ? {}
        : { turbopackRustReactCompiler: true }),
      webpackBuildWorker: true,
      webpackMemoryOptimizations: true,
    },
    logging: {
      browserToTerminal: true,
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
      '/*': ['./src/registry/**/*', './public/r/**/*'],
      '/api/search': ['../../content/docs/**/*'],
      '/r/[style]/[name]': [
        './public/r/*.json',
        './src/__registry__/overlays/**/*.json',
      ],
      '/cn/docs/examples/html-export': ['./public/tailwind.css'],
      '/docs/examples/html-export': ['./public/tailwind.css'],
    },
    partialPrefetching: true,
    reactCompiler: true,
    // Configure domains to allow for optimized image loading.
    // https://nextjs.org/docs/api-reference/next.config.js/react-strict-mod
    reactStrictMode: true,

    staticPageGenerationTimeout: 1200,

    turbopack: {
      root: REPO_ROOT,
      ...(isDev
        ? {
            resolveAlias: buildWorkspaceDevAliases(),
          }
        : {}),
    },

    ...(process.env.PLATE_WWW_WEBPACK
      ? { serverExternalPackages: ['ts-morph'] }
      : { transpilePackages: ['ts-morph'] }),
    typedRoutes: true,

    redirects() {
      return Object.entries(docsRedirects).flatMap(([source, destination]) =>
        ['', '/cn'].flatMap((locale) => [
          {
            source: `${locale}${source}`,
            destination: `${locale}${destination}`,
            permanent: true,
          },
          {
            source: `${locale}${source}.md`,
            destination: `${locale}${destination.split('#')[0]}.md`,
            permanent: true,
          },
          {
            source: `${locale}${source.replace(/^\/docs/, '/llm')}`,
            destination: `${locale}${destination.split('#')[0].replace(/^\/docs/, '/llm')}`,
            permanent: true,
          },
        ])
      );
    },

    rewrites() {
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
      ];
    },
  };

  return withMDX(config);
};

export default nextConfig;
