#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..', '..');
const preStatePath = path.join(repoRoot, '.changeset', 'pre.json');

run('pnpm', ['changeset', 'version']);

if (existsSync(preStatePath)) {
  run('pnpm', ['exec', 'biome', 'format', '--write', '.changeset/pre.json']);
}

run('pnpm', ['install', '--no-frozen-lockfile']);

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    shell: process.platform === 'win32',
    stdio: 'inherit',
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
