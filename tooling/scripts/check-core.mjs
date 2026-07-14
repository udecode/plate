#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const TEST_FILE_RE = /\.(?:spec|test)\.[cm]?[tj]sx?$/;
const CONTRACT_FILE_RE = /-contract\.[cm]?[tj]sx?$/;

const basePackageSlugs = ['core', 'plite', 'utils'];

// Every current package with a completed Plate Next package-review plan.
const reviewedPackageSlugs = [
  'ai',
  'basic-nodes',
  'basic-styles',
  'callout',
  'caption',
  'code-block',
  'code-drawing',
  'combobox',
  'comment',
  'csv',
  'cursor',
  'date',
  'diff',
  'dnd',
  'docx',
  'docx-io',
  'emoji',
  'excalidraw',
  'find-replace',
  'floating',
  'footnote',
  'indent',
  'juice',
  'layout',
  'link',
  'list',
  'list-classic',
  'markdown',
  'math',
  'media',
  'mention',
  'resizable',
  'selection',
  'slash-command',
  'suggestion',
  'tabbable',
  'table',
  'tag',
  'toc',
  'toggle',
];

const packageSlugs = [...basePackageSlugs, ...reviewedPackageSlugs];

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

const packageTestTargets = packageSlugs.map((slug) => {
  const dir = join(root, 'packages', slug);
  const { name } = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));

  return {
    name,
    dir,
    roots: ['src', 'test'].filter((rootName) =>
      existsSync(join(dir, rootName))
    ),
    bunArgs: ['--preload', '../../config/plite-source-test-setup.ts'],
  };
});

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
  TEST_FILE_RE.test(fileName) || CONTRACT_FILE_RE.test(fileName);

const hasModuleMock = (file) =>
  readFileSync(file, 'utf8').includes('mock.module(');

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
  const toRelativeTestPath = (file) =>
    `./${toPosixPath(relative(target.dir, file))}`;
  const sharedFiles = target.files
    .filter((file) => !hasModuleMock(file))
    .map(toRelativeTestPath);
  const isolatedFiles = target.files
    .filter(hasModuleMock)
    .map(toRelativeTestPath);
  const batchSize = getTestBatchSize(sharedFiles.length || 1);
  const batches = [];

  for (let index = 0; index < sharedFiles.length; index += batchSize) {
    batches.push(sharedFiles.slice(index, index + batchSize));
  }
  for (const file of isolatedFiles) {
    batches.push([file]);
  }

  const files = target.files.map(
    (file) => `./${toPosixPath(relative(target.dir, file))}`
  );

  if (files.length === 0) {
    throw new Error(
      `No ${target.name} test files found under ${target.roots.join(', ')}.`
    );
  }

  console.info(
    `\n[check:core] ${target.name} tests (${files.length} files, ${getTestBatchLabel(
      sharedFiles.length,
      batchSize
    )}, ${isolatedFiles.length} module-mock files isolated)`
  );

  for (const [index, batch] of batches.entries()) {
    const label = `${target.name} test batch ${index + 1}/${batches.length}`;

    run(label, 'bun', ['test', ...target.bunArgs, ...batch], {
      cwd: target.dir,
    });
  }
};

const testInventory = collectTestInventory();

run(`typecheck ${packageSlugs.length} Core and reviewed packages`, 'pnpm', [
  'turbo',
  'typecheck',
  '--only',
  ...packageSlugs.map((slug) => `--filter=./packages/${slug}`),
]);
run('type contracts', 'pnpm', [
  'exec',
  'tsc',
  '-p',
  'packages/core/tsconfig.type-tests.json',
  '--noEmit',
]);
for (const target of packageTestTargets) {
  run(`lint ${target.name}`, 'pnpm', ['--filter', target.name, 'lint']);
}
run('build Plite artifact for Core/Utils runtime tests', 'pnpm', [
  '--filter',
  '@platejs/plite',
  'build',
]);
run('build Core artifact for reviewed package runtime tests', 'pnpm', [
  '--filter',
  '@platejs/core',
  'build',
]);
run('build Utils artifact for reviewed package runtime tests', 'pnpm', [
  '--filter',
  '@platejs/utils',
  'build',
]);
for (const target of testInventory) {
  runPackageTests(target);
}
