#!/usr/bin/env node
import { readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const coreDir = join(root, 'packages/core');

const batchSize = Number(process.env.CORE_TEST_BATCH_SIZE ?? 10);

const run = (label, command, args, options = {}) => {
  console.info(`\n[check:core] ${label}`);

  const result = spawnSync(command, args, {
    cwd: root,
    stdio: 'inherit',
    ...options,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

const collectCoreSpecs = (dir) => {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name === 'dist' || entry.name === 'node_modules') continue;

    const path = join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...collectCoreSpecs(path));
      continue;
    }

    if (!entry.isFile()) continue;
    if (!/\.spec\.[cm]?[tj]sx?$/.test(entry.name)) continue;
    files.push(relative(coreDir, path));
  }

  return files.sort();
};

const runCoreTests = () => {
  const files = collectCoreSpecs(join(coreDir, 'src'));

  if (files.length === 0) {
    throw new Error('No Core spec files found under packages/core/src.');
  }

  console.info(
    `\n[check:core] core tests (${files.length} files, batches of ${batchSize})`
  );

  for (let index = 0; index < files.length; index += batchSize) {
    const batch = files.slice(index, index + batchSize);
    const label = `core test batch ${index / batchSize + 1}/${Math.ceil(
      files.length / batchSize
    )}`;

    run(label, 'bun', ['test', ...batch], { cwd: coreDir });
  }
};

run('typecheck Core + Plite', 'pnpm', [
  'turbo',
  'typecheck',
  '--filter=./packages/core',
  '--filter=./packages/plite',
]);
run('typecheck Core specs', 'pnpm', [
  'exec',
  'tsc',
  '-p',
  'packages/core/tsconfig.spec.json',
  '--noEmit',
]);
run('type contracts', 'pnpm', ['test:types']);
run('lint Core', 'pnpm', ['--filter', '@platejs/core', 'lint']);
run('lint Plite', 'pnpm', ['--filter', '@platejs/plite', 'lint']);
runCoreTests();
run('test Plite', 'pnpm', ['--filter', '@platejs/plite', 'test']);
