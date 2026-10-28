#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import { BUN_TEST_TIMEOUT_MS, vitestSuites } from '../config/test-suites.mjs';
import { entrypointDags } from '../entrypoints/entrypoint-dag.mjs';
import {
  getPackageLintFiles,
  getPackageRuntimeTestFiles,
  repoRoot,
} from '../entrypoints/entrypoint-turbo.mjs';
import { usesMockModule } from './import-graph.mjs';
import { runTraced } from './load-trace.mjs';
import { hasPrivateHalf } from './private-files.mjs';

const [command, packageName, partitionName] = process.argv.slice(2);
const definition = entrypointDags[packageName];

if (!definition || !(partitionName in definition.taskPartitions)) {
  console.error(
    'Usage: run-entrypoint-task.mjs <lint|test|typecheck|typecheck-contracts|typecheck-package-tests> <package> <partition>'
  );
  process.exit(1);
}

if (
  (command === 'typecheck-contracts' ||
    command === 'typecheck-package-tests') &&
  !hasPrivateHalf(repoRoot)
) {
  console.info(
    `[${packageName}] skip ${command}: it reads udecode/plate-private's files`
  );
  process.exit(0);
}

const packageRoot = path.join(repoRoot, definition.packageRoot);
const relativePackageFiles = (files) =>
  files.map((filename) => path.relative(packageRoot, filename));

const runProcess = (executable, args, cwd = packageRoot, env = process.env) => {
  const result = spawnSync(executable, args, {
    cwd,
    env,
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

const runPackageTestsTypecheck = () => {
  const configs = ['tsconfig.entrypoints/tests.json'];
  if (packageName === 'plitejs') configs.push('test/react/tsconfig.json');

  for (const config of configs) {
    const status = runProcess(path.join(repoRoot, 'node_modules/.bin/tsc'), [
      '--project',
      config,
      '--pretty',
      'false',
    ]);
    if (status !== 0) return status;
  }

  return 0;
};

const runLint = () => {
  const files = relativePackageFiles(
    getPackageLintFiles(packageName, partitionName)
  );

  if (files.length === 0) return 0;

  return runProcess('pnpm', ['exec', 'ultracite', 'check', ...files]);
};

const runTests = (runtimeTestFiles, traceEnv) => {
  const files = relativePackageFiles(runtimeTestFiles);
  const runTest = (configFile, executable, args, cwd = packageRoot) =>
    runProcess(
      executable,
      args,
      cwd,
      traceEnv([executable, ...args].join(' '), configFile)
    );

  if (files.length === 0) return 0;

  const junitDir = process.env.PLATE_TEST_JUNIT_DIR;
  let batches = 0;
  const reporterArgs = () => {
    if (!junitDir) return [];
    batches += 1;
    return [
      '--reporter=junit',
      `--reporter-outfile=${path.join(junitDir, `batch-${batches}.xml`)}`,
    ];
  };

  const runBunTestBatch = (testFiles) => {
    if (packageName === 'platejs') {
      return runTest(
        path.join(repoRoot, 'bunfig.toml'),
        'bun',
        [
          `--config=${path.join(repoRoot, 'bunfig.toml')}`,
          `--cwd=${repoRoot}`,
          'test',
          `--timeout=${BUN_TEST_TIMEOUT_MS}`,
          ...reporterArgs(),
          // Without `./`, bun treats each path as a substring filter and scans the whole repository for matching test files.
          ...testFiles.map(
            (filename) => `./${path.join(definition.packageRoot, filename)}`
          ),
        ],
        repoRoot
      );
    }

    // Bun reads bunfig.toml from its cwd.
    return runTest(path.join(packageRoot, 'bunfig.toml'), 'bun', [
      'test',
      `--timeout=${BUN_TEST_TIMEOUT_MS}`,
      ...reporterArgs(),
      `--preload=${path.join(repoRoot, 'config/plite-source-test-setup.ts')}`,
      ...testFiles.map((filename) => `./${filename}`),
    ]);
  };

  const runBunTests = (testFiles) => {
    const isolatedFiles = testFiles.filter((filename) =>
      usesMockModule(path.join(packageRoot, filename))
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

  const suite = vitestSuites[packageName];
  const vitestFiles = suite
    ? files.filter((filename) => suite.includes(partitionName, filename))
    : [];
  const bunFiles = files.filter((filename) => !vitestFiles.includes(filename));

  if (bunFiles.length > 0) {
    const status = runBunTests(bunFiles);

    if (status !== 0) return status;
  }

  if (vitestFiles.length > 0) {
    return runTest(path.join(packageRoot, suite.config), 'pnpm', [
      'exec',
      'vitest',
      'run',
      '--config',
      `./${suite.config}`,
      ...suite.args,
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

const runTestTask = () => {
  const testFiles = getPackageRuntimeTestFiles(packageName, partitionName);

  return runTraced(
    { taskId: `${packageName}#test:partition:${partitionName}`, testFiles },
    (traceEnv) => runTests(testFiles, traceEnv)
  );
};

const status =
  command === 'lint'
    ? runLint()
    : command === 'test'
      ? runTestTask()
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
