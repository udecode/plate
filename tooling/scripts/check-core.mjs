#!/usr/bin/env node
import { readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const coreDir = join(root, 'packages/core');
const pliteDir = join(root, 'packages/plite');

const testBatchSizeOverride = process.env.CORE_TEST_BATCH_SIZE;

const getTestBatchSize = (fileCount) => {
  if (testBatchSizeOverride === undefined) return fileCount;

  const batchSize = Math.floor(Number(testBatchSizeOverride));

  if (!Number.isFinite(batchSize) || batchSize <= 0) {
    throw new Error(
      `CORE_TEST_BATCH_SIZE must be a positive number, received "${testBatchSizeOverride}".`
    );
  }

  return batchSize;
};

const getTestBatchLabel = (fileCount, batchSize) =>
  batchSize >= fileCount ? 'all files' : `batches of ${batchSize}`;

const packageTestTargets = [
  {
    name: 'Core',
    dir: coreDir,
    roots: ['src'],
    bunArgs: ['--preload', '../../config/plite-source-test-setup.ts'],
  },
  {
    name: 'Plite',
    dir: pliteDir,
    roots: ['src', 'test'],
    bunArgs: ['--preload', '../../config/plite-source-test-setup.ts'],
  },
];

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

const toPosixPath = (path) => path.split(sep).join('/');

const isTestFile = (fileName) =>
  /\.(?:spec|test)\.[cm]?[tj]sx?$/.test(fileName) ||
  /-contract\.[cm]?[tj]sx?$/.test(fileName);

const collectTestFiles = (dir) => {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name === 'dist' || entry.name === 'node_modules') continue;

    const path = join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...collectTestFiles(path));
      continue;
    }

    if (!entry.isFile()) continue;
    if (!isTestFile(entry.name)) continue;
    files.push(path);
  }

  return files.sort();
};

const collectPackageTestFiles = (target) =>
  target.roots
    .flatMap((rootName) => collectTestFiles(join(target.dir, rootName)))
    .sort();

const collectTestInventory = () =>
  packageTestTargets.map((target) => ({
    ...target,
    files: collectPackageTestFiles(target),
  }));

const runPackageTests = (target) => {
  const files = target.files.map(
    (file) => `./${toPosixPath(relative(target.dir, file))}`
  );

  if (files.length === 0) {
    throw new Error(
      `No ${target.name} test files found under ${target.roots.join(', ')}.`
    );
  }

  const batchSize = getTestBatchSize(files.length);

  console.info(
    `\n[check:core] ${target.name} tests (${files.length} files, ${getTestBatchLabel(
      files.length,
      batchSize
    )})`
  );

  for (let index = 0; index < files.length; index += batchSize) {
    const batch = files.slice(index, index + batchSize);
    const label = `${target.name} test batch ${index / batchSize + 1}/${Math.ceil(
      files.length / batchSize
    )}`;

    run(label, 'bun', ['test', ...target.bunArgs, ...batch], {
      cwd: target.dir,
    });
  }
};

const testInventory = collectTestInventory();

run('typecheck Core + Plite source and tests', 'pnpm', [
  'turbo',
  'typecheck',
  '--filter=./packages/core',
  '--filter=./packages/plite',
]);
run('type contracts', 'pnpm', [
  'exec',
  'tsc',
  '-p',
  'packages/core/tsconfig.type-tests.json',
  '--noEmit',
]);
run('lint Core', 'pnpm', ['--filter', '@platejs/core', 'lint']);
run('lint Plite', 'pnpm', ['--filter', '@platejs/plite', 'lint']);
run('build Plite artifact for Core runtime tests', 'pnpm', [
  '--filter',
  '@platejs/plite',
  'build',
]);
for (const target of testInventory) {
  runPackageTests(target);
}
