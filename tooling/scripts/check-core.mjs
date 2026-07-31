#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = process.cwd();
const TEST_FILE_RE = /\.(?:spec|test)\.[cm]?[tj]sx?$/;
const CONTRACT_FILE_RE = /-contract\.[cm]?[tj]sx?$/;
const TOP_LEVEL_AMBIENT_VALUE_RE =
  /^declare\s+(?:const|let|var|function|class)\b/m;

const basePackageSlugs = ['core', 'plite', 'utils'];

// Every current package with a completed Plate Next package-review plan.
const reviewedPackageSlugs = [
  'ai',
  'basic-nodes',
  'basic-styles',
  'callout',
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
  'plate',
  'resizable',
  'selection',
  'slash-command',
  'suggestion',
  'tabbable',
  'table',
  'tag',
  'test-utils',
  'toc',
  'toggle',
  'yjs',
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
    bunArgs: ['--config=../../bunfig.toml'],
  };
});

export const createPackageTestCommandArgs = (target, batch) => [
  ...target.bunArgs,
  'test',
  ...batch,
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

const isPathInside = (parent, child) => {
  const path = relative(parent, child);

  return (
    path !== '' &&
    path !== '..' &&
    !path.startsWith(`..${sep}`) &&
    !isAbsolute(path)
  );
};

const readGenericTypeConfig = (repoRoot, configPath) => {
  const relativeConfigPath = toPosixPath(relative(repoRoot, configPath));
  let config;

  try {
    config = JSON.parse(readFileSync(configPath, 'utf8'));
  } catch (error) {
    throw new Error(`Invalid generic type config ${relativeConfigPath}.`, {
      cause: error,
    });
  }

  if (!Array.isArray(config.files) || config.files.length === 0) {
    throw new Error(
      `Generic type config ${relativeConfigPath} must declare a non-empty files array.`
    );
  }

  const testRoot = dirname(configPath);
  const files = config.files.map((file) => {
    if (typeof file !== 'string' || file.length === 0) {
      throw new Error(
        `Generic type config ${relativeConfigPath} contains an invalid file declaration.`
      );
    }

    const resolvedFile = resolve(testRoot, file);
    const relativeFile = toPosixPath(relative(repoRoot, resolvedFile));

    if (!isPathInside(testRoot, resolvedFile)) {
      throw new Error(
        `Generic type config ${relativeConfigPath} declares ${relativeFile} outside its package test root.`
      );
    }
    if (!existsSync(resolvedFile) || !statSync(resolvedFile).isFile()) {
      throw new Error(
        `Generic type config ${relativeConfigPath} declares missing file ${relativeFile}.`
      );
    }

    return resolvedFile;
  });

  if (new Set(files).size !== files.length) {
    throw new Error(
      `Generic type config ${relativeConfigPath} contains duplicate file declarations.`
    );
  }

  const packageDir = dirname(testRoot);
  const packageJsonPath = join(packageDir, 'package.json');

  if (!existsSync(packageJsonPath)) {
    throw new Error(
      `Generic type config ${relativeConfigPath} has no owning package.json.`
    );
  }

  const { name } = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

  if (typeof name !== 'string' || name.length === 0) {
    throw new Error(
      `Generic type config ${relativeConfigPath} has no owning package name.`
    );
  }

  return {
    configPath,
    files: Object.freeze(files),
    name,
  };
};

export const discoverGenericTypeConfigs = (repoRoot) => {
  const packagesDir = join(repoRoot, 'packages');

  return readdirSync(packagesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) =>
      join(packagesDir, entry.name, 'test', 'tsconfig.generic-types.json')
    )
    .filter(existsSync)
    .sort()
    .map((configPath) => readGenericTypeConfig(repoRoot, configPath));
};

export const createGenericTypecheckGates = (repoRoot, configs) =>
  configs.map((config) => ({
    args: [
      'exec',
      'tsc',
      '-p',
      toPosixPath(relative(repoRoot, config.configPath)),
      '--noEmit',
    ],
    command: 'pnpm',
    label: `${config.name} generic type contracts (${config.files.length} ${config.files.length === 1 ? 'file' : 'files'})`,
  }));

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

export const collectPackageTestFiles = (target, genericTypeFiles = new Set()) =>
  target.roots
    .flatMap((rootName) => collectTestFiles(join(target.dir, rootName)))
    .filter((file) => {
      if (genericTypeFiles.has(file)) return false;

      if (TOP_LEVEL_AMBIENT_VALUE_RE.test(readFileSync(file, 'utf8'))) {
        throw new Error(
          `Runtime test contract ${toPosixPath(relative(root, file))} contains a top-level ambient value declaration. Declare it in the owning package's test/tsconfig.generic-types.json files array.`
        );
      }

      return true;
    })
    .sort();

const collectTestInventory = (genericTypeFiles) =>
  packageTestTargets.map((target) => ({
    ...target,
    files: collectPackageTestFiles(target, genericTypeFiles),
  }));

const runPackageTests = (target) => {
  const toRelativeTestPath = (file) =>
    `./${toPosixPath(relative(target.dir, file))}`;
  const sharedFiles = target.files
    .filter((file) => !hasModuleMock(file) && !CONTRACT_FILE_RE.test(file))
    .map(toRelativeTestPath);
  const isolatedFiles = target.files
    .filter((file) => hasModuleMock(file) || CONTRACT_FILE_RE.test(file))
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
    )}, ${isolatedFiles.length} contract or module-mock files isolated)`
  );

  for (const [index, batch] of batches.entries()) {
    const label = `${target.name} test batch ${index + 1}/${batches.length}`;

    run(label, 'bun', createPackageTestCommandArgs(target, batch), {
      cwd: target.dir,
    });
  }
};

const main = () => {
  const genericTypeConfigs = discoverGenericTypeConfigs(root);
  const genericTypeFiles = new Set(
    genericTypeConfigs.flatMap((config) => config.files)
  );
  const testInventory = collectTestInventory(genericTypeFiles);

  run('Core runner contracts', 'node', [
    '--test',
    'tooling/scripts/check-core.test.mjs',
  ]);
  run('source declaration leak contracts', 'node', [
    '--test',
    'tooling/scripts/check-source-declaration-leaks.test.mjs',
  ]);
  run('source declaration leak audit', 'node', [
    'tooling/scripts/check-source-declaration-leaks.mjs',
  ]);
  run('package declaration brand contracts', 'node', [
    '--test',
    'tooling/scripts/check-package-declaration-brands.test.mjs',
  ]);
  run('Plate schema adoption audit contracts', 'node', [
    '--test',
    'tooling/scripts/check-plate-schema-adoption.test.mjs',
  ]);
  run('Plate schema adoption source audit', 'node', [
    'tooling/scripts/check-plate-schema-adoption.mjs',
  ]);
  run('Plate docs code contract tests', 'node', [
    '--test',
    'tooling/scripts/check-plate-doc-code-contracts.test.mjs',
  ]);
  run('Plate docs code contract audit', 'node', [
    'tooling/scripts/check-plate-doc-code-contracts.mjs',
  ]);
  run('Plite docs audit contracts', 'node', [
    '--test',
    'tooling/scripts/check-plite-docs.test.mjs',
  ]);
  run('Plite docs audit', 'node', ['tooling/scripts/check-plite-docs.mjs']);
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
  run('post-typecheck source declaration leak audit', 'node', [
    'tooling/scripts/check-source-declaration-leaks.mjs',
  ]);
  for (const gate of createGenericTypecheckGates(root, genericTypeConfigs)) {
    run(gate.label, gate.command, gate.args);
  }
  run(`lint ${packageSlugs.length} Core and reviewed packages`, 'pnpm', [
    'turbo',
    'lint',
    '--only',
    ...packageSlugs.map((slug) => `--filter=./packages/${slug}`),
  ]);
  for (const target of testInventory) {
    runPackageTests(target);
  }
};

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main();
}
