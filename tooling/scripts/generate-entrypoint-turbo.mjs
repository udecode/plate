#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import path from 'node:path';

import { entrypointDags } from '../entrypoints/entrypoint-dag.mjs';
import {
  assertClientRuntimeProofGenerated,
  clientRuntimeProofPath,
  writeClientRuntimeProofGenerated,
} from '../entrypoints/entrypoint-runtime.mjs';
import {
  assertEntrypointTurboGenerated,
  entrypointPackageNames,
  repoRoot,
  writeEntrypointTurboGenerated,
} from '../entrypoints/entrypoint-turbo.mjs';
import {
  assertWorkspaceSourcePathsGenerated,
  workspaceSourcePathConfigFiles,
  writeWorkspaceSourcePathsGenerated,
} from '../entrypoints/workspace-source-paths.mjs';

const mode = process.argv[2] ?? 'generate';

if (!['check', 'generate'].includes(mode)) {
  console.error('Usage: generate-entrypoint-turbo.mjs [generate|check]');
  process.exit(1);
}

for (const packageName of entrypointPackageNames) {
  if (mode === 'check') {
    assertEntrypointTurboGenerated(packageName);
  } else {
    writeEntrypointTurboGenerated(packageName);
  }
}

if (mode === 'check') {
  assertClientRuntimeProofGenerated();
  assertWorkspaceSourcePathsGenerated(repoRoot);
} else {
  writeClientRuntimeProofGenerated();
  writeWorkspaceSourcePathsGenerated(repoRoot);
}

if (mode === 'generate') {
  const files = entrypointPackageNames.flatMap((packageName) => {
    const { packageRoot } = entrypointDags[packageName];

    return [
      `${packageRoot}/package.json`,
      `${packageRoot}/turbo.json`,
      `${packageRoot}/tsconfig.entrypoints/*.json`,
    ];
  });
  files.push(path.relative(repoRoot, clientRuntimeProofPath));
  files.push(...workspaceSourcePathConfigFiles);
  const result = spawnSync(
    path.join(repoRoot, 'node_modules/.bin/oxfmt'),
    ['--write', ...files],
    { cwd: repoRoot, stdio: 'inherit' }
  );

  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log(
  mode === 'check'
    ? `Entrypoint Turbo config is current for ${entrypointPackageNames.join(', ')}.`
    : `Generated entrypoint Turbo config for ${entrypointPackageNames.join(', ')}.`
);
