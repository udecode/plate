#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import path from 'node:path';

import {
  TEST_TIMEOUT_MS,
  vitestSuiteOf,
  vitestSuites,
} from '../config/test-suites.mjs';
import { entrypointDags } from '../entrypoints/entrypoint-dag.mjs';
import {
  getPackageLintFiles,
  getPackageRuntimeTestFiles,
  repoRoot,
} from '../entrypoints/entrypoint-turbo.mjs';
import { usesMockModule } from './import-graph.mjs';
import { runTraced } from './load-trace.mjs';

// Bun gives a module its test globals when it transpiles it, and reuses a
// transpile a plain `bun` run cached for a file over 4 KB, so a test helper a
// script imported first throws `describe is not defined` under `bun test`.
process.env.BUN_RUNTIME_TRANSPILER_CACHE_PATH = '0';

const [command, packageName, partitionList = '', ...onlyFiles] =
  process.argv.slice(2);
const definition = entrypointDags[packageName];
const partitionNames = partitionList.split(',');

if (
  !['lint', 'test'].includes(command) ||
  !definition ||
  !partitionNames.every((name) => name in definition.taskPartitions)
) {
  console.error(
    'Usage: run-entrypoint-task.mjs <lint|test> <package> <partition>[,<partition>...] [test files]'
  );
  process.exit(1);
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

const runLint = () => {
  const files = relativePackageFiles(
    partitionNames.flatMap((name) => getPackageLintFiles(packageName, name))
  );

  if (files.length === 0) return 0;

  return runProcess('pnpm', ['exec', 'ultracite', 'check', ...files]);
};

const runTests = (runtimeTestFiles, partitionOf, traceEnv) => {
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
  const reports = [];
  // Bun names each file relative to its cwd, so reports.json pairs each
  // report with the cwd its batch ran in.
  const reporterArgs = (runner, cwd = packageRoot) => {
    if (!junitDir) return [];
    const outfile = path.join(junitDir, `batch-${reports.length + 1}.xml`);
    reports.push({ cwd, path: outfile });
    writeFileSync(path.join(junitDir, 'reports.json'), JSON.stringify(reports));
    return runner === 'vitest'
      ? [
          '--reporter=default',
          '--reporter=junit',
          `--outputFile.junit=${outfile}`,
        ]
      : ['--reporter=junit', `--reporter-outfile=${outfile}`];
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
          `--timeout=${TEST_TIMEOUT_MS}`,
          ...reporterArgs('bun', repoRoot),
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
      `--timeout=${TEST_TIMEOUT_MS}`,
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

    return [
      ...(sharedFiles.length > 0 ? [runBunTestBatch(sharedFiles)] : []),
      // Bun module mocks outlive an individual test file in a shared process.
      ...isolatedFiles.map((filename) => runBunTestBatch([filename])),
    ];
  };

  const suiteOf = (filename) =>
    vitestSuiteOf(
      packageName,
      partitionOf.get(path.join(packageRoot, filename)),
      filename
    );
  const bunFiles = files.filter((filename) => !suiteOf(filename));
  const batchStatuses = bunFiles.length > 0 ? runBunTests(bunFiles) : [];

  for (const suite of vitestSuites[packageName] ?? []) {
    const vitestFiles = files.filter((filename) => suiteOf(filename) === suite);

    if (vitestFiles.length === 0) continue;

    batchStatuses.push(
      runTest(path.join(packageRoot, suite.config), 'pnpm', [
        'exec',
        'vitest',
        'run',
        '--config',
        `./${suite.config}`,
        `--testTimeout=${TEST_TIMEOUT_MS}`,
        ...reporterArgs('vitest'),
        ...suite.args,
        ...vitestFiles,
      ])
    );
  }

  return batchStatuses.find((status) => status !== 0) ?? 0;
};

const runTestTask = () => {
  const only = new Set(onlyFiles.map((file) => path.resolve(repoRoot, file)));
  const partitionOf = new Map(
    partitionNames.flatMap((name) =>
      getPackageRuntimeTestFiles(packageName, name)
        .filter((file) => only.size === 0 || only.has(file))
        .map((file) => [file, name])
    )
  );
  const testFiles = [...partitionOf.keys()];
  const run = (traceEnv) => runTests(testFiles, partitionOf, traceEnv);
  const turboTaskId =
    partitionNames.length === 1
      ? `${packageName}#test:partition:${partitionNames[0]}`
      : null;

  return turboTaskId
    ? runTraced({ taskId: turboTaskId, testFiles }, run)
    : run(() => process.env);
};

process.exit(command === 'lint' ? runLint() : runTestTask());
