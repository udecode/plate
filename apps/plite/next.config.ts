import fs from 'node:fs';
import path from 'node:path';

import type { NextConfig } from 'next';

const APP_ROOT = import.meta.dirname;
const REPO_ROOT = path.resolve(APP_ROOT, '../..');
const WWW_ROOT = path.join(REPO_ROOT, 'apps/www');
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
  const tsFileEntry = `${dir}.ts`;
  const tsxFileEntry = `${dir}.tsx`;
  const jsFileEntry = `${dir}.js`;

  if (fs.existsSync(tsEntry)) return tsEntry;
  if (fs.existsSync(tsxEntry)) return tsxEntry;
  if (fs.existsSync(jsEntry)) return jsEntry;
  if (fs.existsSync(tsFileEntry)) return tsFileEntry;
  if (fs.existsSync(tsxFileEntry)) return tsxFileEntry;
  if (fs.existsSync(jsFileEntry)) return jsFileEntry;

  return null;
};

const WORKSPACE_ALIAS_SUBPATHS = [
  'browser',
  'core',
  'internal',
  'playwright',
  'react',
  'static',
  'transports',
];

const addAliasEntries = (
  aliases: Record<string, string>,
  importPath: string,
  packageDir: string,
  rootDirName: 'dist' | 'src'
) => {
  const rootDir = path.join(packageDir, rootDirName);
  const rootEntry = getIndexEntry(rootDir);

  if (rootEntry) aliases[`${importPath}$`] = toAppImportPath(rootEntry);

  for (const subpath of WORKSPACE_ALIAS_SUBPATHS) {
    const subpathEntry = getIndexEntry(path.join(rootDir, subpath));

    if (subpathEntry) {
      aliases[`${importPath}/${subpath}$`] = toAppImportPath(subpathEntry);
    }
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

const buildWorkspaceDevAliases = () => ({
  ...buildWorkspaceAliases('src'),
  '@': toAppImportPath(path.join(WWW_ROOT, 'src')),
  '@platejs/plite/internal$': toAppImportPath(
    path.join(PACKAGES_ROOT, 'plite/src/internal/index.ts')
  ),
  '@platejs/plite-layout/react$': toAppImportPath(
    path.join(PACKAGES_ROOT, 'plite-layout/src/react.tsx')
  ),
  '@platejs/yjs/react$': toAppImportPath(
    path.join(PACKAGES_ROOT, 'yjs/src/react/index.ts')
  ),
});

const buildWorkspaceDevWebpackAliases = () =>
  Object.fromEntries(
    Object.entries(buildWorkspaceDevAliases()).map(([key, value]) => [
      key,
      path.resolve(APP_ROOT, value),
    ])
  );

const nextConfig: NextConfig = {
  distDir: '.next',
  experimental: {
    externalDir: true,
  },
  output: 'export',
  reactCompiler: true,
  reactStrictMode: true,
  trailingSlash: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      ...buildWorkspaceDevWebpackAliases(),
    };

    return config;
  },
};

export default nextConfig;
