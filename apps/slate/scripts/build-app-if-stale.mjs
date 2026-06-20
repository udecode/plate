#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(appRoot, '../..');

const slatePackageNames = [
  'browser',
  'slate',
  'slate-dom',
  'slate-history',
  'slate-hyperscript',
  'slate-layout',
  'slate-react',
  'yjs',
];

const sourceEntries = [
  path.join(appRoot, 'src'),
  path.join(appRoot, 'next.config.ts'),
  path.join(appRoot, 'package.json'),
  path.join(appRoot, 'tsconfig.json'),
  path.join(repoRoot, 'apps/www/src/app/(app)/examples/slate'),
  path.join(repoRoot, 'apps/www/src/components/ui'),
  path.join(repoRoot, 'apps/www/src/components/preview-dev-overlay-styles.tsx'),
  path.join(repoRoot, 'apps/www/src/lib/utils.ts'),
  path.join(repoRoot, 'apps/www/src/utils/cn.ts'),
  ...slatePackageNames.flatMap((packageName) => {
    const packageRoot = path.join(repoRoot, 'packages', packageName);

    return [path.join(packageRoot, 'src'), path.join(packageRoot, 'package.json')];
  }),
].filter((entryPath) => fs.existsSync(entryPath));

const requiredOutputs = [
  path.join(appRoot, 'out/index.html'),
  path.join(appRoot, 'out/examples/slate/richtext.html'),
  path.join(appRoot, 'out/examples/slate/plaintext.html'),
  path.join(appRoot, 'out/examples/slate/huge-document.html'),
];

const latestMtimeMs = (entryPath) => {
  const stat = fs.statSync(entryPath);

  if (!stat.isDirectory()) return stat.mtimeMs;

  let latest = stat.mtimeMs;

  for (const entry of fs.readdirSync(entryPath, { withFileTypes: true })) {
    if (
      entry.name === '.next' ||
      entry.name === 'dist' ||
      entry.name === 'node_modules' ||
      entry.name === 'out' ||
      entry.name === 'test-results'
    ) {
      continue;
    }

    latest = Math.max(latest, latestMtimeMs(path.join(entryPath, entry.name)));
  }

  return latest;
};

const outputsAreFresh = () => {
  if (process.env.SLATE_PROOF_FORCE_BUILD === '1') {
    return false;
  }

  if (requiredOutputs.some((outputPath) => !fs.existsSync(outputPath))) {
    return false;
  }

  const latestSourceMtime = Math.max(...sourceEntries.map(latestMtimeMs));
  const oldestOutputMtime = Math.min(
    ...requiredOutputs.map((outputPath) => fs.statSync(outputPath).mtimeMs)
  );

  return oldestOutputMtime >= latestSourceMtime;
};

if (outputsAreFresh()) {
  console.log('slate proof app export is fresh');
  process.exit(0);
}

const result = spawnSync('pnpm', ['build'], {
  cwd: appRoot,
  shell: true,
  stdio: 'inherit',
});

process.exit(result.status ?? 1);
