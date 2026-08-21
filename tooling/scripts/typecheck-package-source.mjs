#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { getWorkspaceSourceEntries } from '../../config/workspace-source-entries.mjs';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDirectory, '../..');
const [configArgument, ...tscArguments] = process.argv.slice(2);

if (!configArgument) {
  console.error('Usage: typecheck-package-source.mjs <tsconfig> [...tsc args]');
  process.exit(1);
}

const packageConfig = path.resolve(configArgument);
const packageRoot = path.dirname(packageConfig);
const packageConfigJson = JSON.parse(readFileSync(packageConfig, 'utf-8'));
const cacheDirectory = path.join(
  repoRoot,
  'node_modules/.cache/plate-source-typecheck'
);
const cacheName = path
  .relative(repoRoot, packageRoot)
  .replaceAll(/[\\/]/g, '__');
const sourceConfig = path.join(cacheDirectory, `${cacheName}.json`);
const localPaths = Object.fromEntries(
  Object.entries(packageConfigJson.compilerOptions?.paths ?? {}).map(
    ([specifier, targets]) => [
      specifier,
      targets.map((target) =>
        path.isAbsolute(target) ? target : path.resolve(packageRoot, target)
      ),
    ]
  )
);
const workspacePaths = Object.fromEntries(
  getWorkspaceSourceEntries(repoRoot).map(({ sourceEntry, specifier }) => [
    specifier,
    [sourceEntry],
  ])
);
const configContents = `${JSON.stringify(
  {
    extends: packageConfig,
    compilerOptions: {
      paths: {
        ...localPaths,
        ...workspacePaths,
      },
    },
  },
  null,
  2
)}\n`;

mkdirSync(cacheDirectory, { recursive: true });

let currentContents;

try {
  currentContents = readFileSync(sourceConfig, 'utf-8');
} catch {
  // A missing source config is created from the canonical contents below.
}

if (currentContents !== configContents) {
  writeFileSync(sourceConfig, configContents);
}

const executable = path.join(
  repoRoot,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'tsc.cmd' : 'tsc'
);
const result = spawnSync(executable, ['-p', sourceConfig, ...tscArguments], {
  cwd: packageRoot,
  stdio: 'inherit',
});

if (result.error) throw result.error;

process.exit(result.status ?? 1);
