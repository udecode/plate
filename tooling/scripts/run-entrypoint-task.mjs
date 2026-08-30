#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import { entrypointDags } from '../entrypoints/entrypoint-dag.mjs';
import {
  getPackageLintFiles,
  getPackageRuntimeTestFiles,
  repoRoot,
} from '../entrypoints/entrypoint-turbo.mjs';

const [command, packageName, partitionName] = process.argv.slice(2);
const definition = entrypointDags[packageName];

if (!definition || !(partitionName in definition.taskPartitions)) {
  console.error(
    'Usage: run-entrypoint-task.mjs <lint|test|typecheck|typecheck-contracts|typecheck-package-tests> <package> <partition>'
  );
  process.exit(1);
}

const packageRoot = path.join(repoRoot, definition.packageRoot);
const relativePackageFiles = (files) =>
  files.map((filename) => path.relative(packageRoot, filename));

const runProcess = (executable, args, cwd = packageRoot) => {
  const result = spawnSync(executable, args, {
    cwd,
    env: process.env,
    stdio: 'inherit',
  });

  if (result.error) throw result.error;

  return result.status ?? 1;
};

const runTypecheck = () => {
  const configPath = path.join(
    packageRoot,
    'tsconfig.entrypoints',
    `${partitionName}.json`
  );

  return runProcess(
    path.join(repoRoot, 'node_modules/.bin/tsc'),
    ['--build', configPath, '--pretty', 'false'],
    repoRoot
  );
};

const runPackageTestsTypecheck = () =>
  runProcess(path.join(repoRoot, 'node_modules/.bin/tsc'), [
    '--project',
    'tsconfig.entrypoints/tests.json',
    '--pretty',
    'false',
  ]);

const runLint = () => {
  const files = relativePackageFiles(
    getPackageLintFiles(packageName, partitionName)
  );

  if (files.length === 0) return 0;

  return runProcess('pnpm', ['exec', 'ultracite', 'check', ...files]);
};

const runTests = () => {
  const files = relativePackageFiles(
    getPackageRuntimeTestFiles(packageName, partitionName)
  );

  if (files.length === 0) return 0;

  if (packageName === '@platejs/test' && partitionName === 'browser') {
    return runProcess('pnpm', [
      'exec',
      'vitest',
      'run',
      '--config',
      './vitest.config.ts',
      '--project',
      'browser',
      ...files,
    ]);
  }

  const runBunTestBatch = (testFiles) => {
    if (packageName === 'platejs') {
      return runProcess(
        'bun',
        [
          `--config=${path.join(repoRoot, 'bunfig.toml')}`,
          `--cwd=${repoRoot}`,
          'test',
          ...testFiles.map((filename) =>
            path.join(definition.packageRoot, filename)
          ),
        ],
        repoRoot
      );
    }

    return runProcess('bun', [
      'test',
      `--preload=${path.join(repoRoot, 'config/plite-source-test-setup.ts')}`,
      ...testFiles.map((filename) => `./${filename}`),
    ]);
  };

  const runBunTests = (testFiles) => {
    const isolatedFiles = testFiles.filter((filename) =>
      fs
        .readFileSync(path.join(packageRoot, filename), 'utf-8')
        .includes('mock.module(')
    );
    const sharedFiles = testFiles.filter(
      (filename) => !isolatedFiles.includes(filename)
    );

    if (sharedFiles.length > 0) {
      const status = runBunTestBatch(sharedFiles);

      if (status !== 0) return status;
    }

    // Bun module mocks outlive an individual test file in a shared process.
    for (const filename of isolatedFiles) {
      const status = runBunTestBatch([filename]);

      if (status !== 0) return status;
    }

    return 0;
  };

  if (packageName === 'platejs') {
    return runBunTests(files);
  }

  const vitestFiles =
    packageName === 'plitejs'
      ? files.filter((filename) => filename.startsWith('test/react/'))
      : [];
  const bunFiles = files.filter((filename) => !vitestFiles.includes(filename));

  if (bunFiles.length > 0) {
    const status = runBunTests(bunFiles);

    if (status !== 0) return status;
  }

  if (vitestFiles.length > 0) {
    return runProcess('pnpm', [
      'exec',
      'vitest',
      'run',
      '--config',
      './vitest.config.mjs',
      ...vitestFiles,
    ]);
  }

  return 0;
};

const runContracts = () => {
  if (packageName === 'platejs') {
    fs.rmSync(path.join(repoRoot, '.tmp/plate-type-contract-declarations'), {
      force: true,
      recursive: true,
    });

    return runProcess(path.join(repoRoot, 'node_modules/.bin/tsc'), [
      '--project',
      'tsconfig.entrypoints/contracts.json',
      '--pretty',
      'false',
    ]);
  }

  return runProcess(path.join(repoRoot, 'node_modules/.bin/tsc'), [
    '--project',
    'tsconfig.entrypoints/contracts.json',
    '--pretty',
    'false',
  ]);
};

const status =
  command === 'lint'
    ? runLint()
    : command === 'test'
      ? runTests()
      : command === 'typecheck'
        ? runTypecheck()
        : command === 'typecheck-package-tests'
          ? runPackageTestsTypecheck()
          : command === 'typecheck-contracts'
            ? runContracts()
            : 1;

if (status === 1 && !command) {
  console.error('Missing entrypoint task command.');
}

process.exit(status);
