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
  'diff',
  'dom',
  'history',
  'hyperscript',
  'internal',
  'pagination',
  'pagination/react',
  'playwright',
  'react',
  'react/internal',
  'static',
  'testing',
];

const addAliasEntries = (
  aliases: Record<string, string>,
  importPath: string,
  packageDir: string,
  rootDirName: 'dist' | 'src'
) => {
  const rootDir = path.join(packageDir, rootDirName);
  const rootEntry = getIndexEntry(rootDir);
  const manifestPath = path.join(packageDir, 'package.json');
  const publicSubpaths = fs.existsSync(manifestPath)
    ? Object.keys(
        (
          JSON.parse(fs.readFileSync(manifestPath, 'utf-8')) as {
            exports?: Record<string, unknown>;
          }
        ).exports ?? {}
      )
        .filter((subpath) => subpath.startsWith('./'))
        .map((subpath) => subpath.slice(2))
        .filter(
          (subpath) => subpath !== 'package.json' && !subpath.endsWith('.css')
        )
    : [];

  if (rootEntry) aliases[importPath] = toAppImportPath(rootEntry);

  for (const subpath of new Set([
    ...WORKSPACE_ALIAS_SUBPATHS,
    ...publicSubpaths,
  ])) {
    const subpathEntry = getIndexEntry(path.join(rootDir, subpath));

    if (subpathEntry) {
      aliases[`${importPath}/${subpath}`] = toAppImportPath(subpathEntry);
    }
  }
};

const buildWorkspaceAliases = (rootDirName: 'dist' | 'src') => {
  const aliases: Record<string, string> = {};

  addAliasEntries(
    aliases,
    'platejs',
    path.join(PACKAGES_ROOT, 'platejs'),
    rootDirName
  );
  addAliasEntries(
    aliases,
    'plitejs',
    path.join(PACKAGES_ROOT, 'plitejs'),
    rootDirName
  );

  for (const entry of fs.readdirSync(PACKAGES_ROOT, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;

    const manifestPath = path.join(PACKAGES_ROOT, entry.name, 'package.json');

    if (!fs.existsSync(manifestPath)) continue;

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8')) as {
      name?: string;
    };

    if (!manifest.name?.startsWith('@')) continue;

    addAliasEntries(
      aliases,
      manifest.name,
      path.join(PACKAGES_ROOT, entry.name),
      rootDirName
    );
  }

  return aliases;
};

const buildWorkspaceDevAliases = () => ({
  ...buildWorkspaceAliases('src'),
  '@': toAppImportPath(path.join(WWW_ROOT, 'src')),
});

const nextConfig: NextConfig = {
  distDir: '.next',
  experimental: {
    externalDir: true,
    instantInsights: {
      validationLevel: 'manual-warning',
    },
    turbopackRustReactCompiler: true,
  },
  logging: {
    browserToTerminal: true,
  },
  output: 'export',
  reactCompiler: true,
  reactStrictMode: true,
  trailingSlash: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {
    root: REPO_ROOT,
    resolveAlias: buildWorkspaceDevAliases(),
  },
  typedRoutes: true,
};

export default nextConfig;
