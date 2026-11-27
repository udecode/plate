#!/usr/bin/env node

import { spawn, spawnSync } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';
import { availableParallelism } from 'node:os';
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

const writeStream = (stream, chunks) =>
  chunks.length === 0
    ? Promise.resolve()
    : new Promise((resolve, reject) => {
        stream.write(Buffer.concat(chunks), (error) => {
          if (error) {
            reject(error instanceof Error ? error : new Error(String(error)));
          } else {
            resolve();
          }
        });
      });

let flushQueue = Promise.resolve();

const flushBufferedOutput = (stdout, stderr) => {
  const flush = flushQueue.then(async () => {
    await writeStream(process.stdout, stdout);
    await writeStream(process.stderr, stderr);
  });

  flushQueue = flush.catch(() => {});

  return flush;
};

const runProcessAsync = (
  executable,
  args,
  cwd = packageRoot,
  env = process.env,
  { buffered = false } = {}
) =>
  new Promise((resolve, reject) => {
    const child = spawn(executable, args, {
      cwd,
      env,
      stdio: buffered ? ['ignore', 'pipe', 'pipe'] : 'inherit',
    });
    const stdout = [];
    const stderr = [];

    if (buffered) {
      child.stdout.on('data', (chunk) => stdout.push(chunk));
      child.stderr.on('data', (chunk) => stderr.push(chunk));
    }

    child.once('error', reject);
    child.once('close', (code, signal) => {
      if (code === null && signal) {
        const message = `${executable} terminated by signal ${signal}\n`;

        if (buffered) stderr.push(Buffer.from(message));
        else process.stderr.write(message);
      }

      if (!buffered) {
        resolve(code ?? 1);
        return;
      }

      flushBufferedOutput(stdout, stderr).then(
        () => resolve(code ?? 1),
        reject
      );
    });
  });

const runLint = () => {
  const files = relativePackageFiles(
    partitionNames.flatMap((name) => getPackageLintFiles(packageName, name))
  );

  if (files.length === 0) return 0;

  return runProcess('pnpm', ['exec', 'ultracite', 'check', ...files]);
};

const runTests = async (runtimeTestFiles, partitionOf, traceEnv) => {
  const files = relativePackageFiles(runtimeTestFiles);

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

  const bunParallelWorkers = (fileCount, { isolated = false } = {}) => {
    if (fileCount < (isolated ? 2 : 4)) return 1;

    const cpus = availableParallelism();
    // Turbo runs multiple partitions concurrently, so bound per-batch workers
    // tightly under Turbo to avoid CPU oversubscription and test timeouts, and
    // stay single-process on <= 4-core runners.
    const turboCap = isolated ? 2 : fileCount >= 40 ? 3 : 2;
    const maxWorkers = process.env.TURBO_HASH
      ? Math.min(turboCap, Math.floor(cpus / (isolated ? 6 : 4)))
      : Math.min(6, Math.floor(cpus / 2));

    if (maxWorkers <= 1) return 1;

    return isolated
      ? Math.min(maxWorkers, fileCount)
      : Math.min(maxWorkers, Math.floor(fileCount / 2));
  };

  const vitestParallelArgs = (suite) => {
    if (
      !process.env.TURBO_HASH ||
      suite.browser ||
      suite.config !== 'vitest.config.mjs'
    ) {
      return [];
    }

    const workers = Math.max(
      1,
      Math.min(6, Math.floor(availableParallelism() / 3))
    );

    return [`--maxWorkers=${workers}`];
  };

  const batches = [];
  const queueBatch = (configFile, executable, args, cwd = packageRoot) => {
    batches.push({
      args,
      cwd,
      env: traceEnv([executable, ...args].join(' '), configFile),
      executable,
    });
  };

  const queueBunTestBatch = (testFiles, { isolated = false } = {}) => {
    const workers = bunParallelWorkers(testFiles.length, { isolated });
    const parallelArgs =
      workers > 1
        ? [`--parallel=${workers}`, ...(isolated ? [] : ['--no-isolate'])]
        : [];

    if (packageName === 'platejs') {
      queueBatch(
        path.join(repoRoot, 'bunfig.toml'),
        'bun',
        [
          `--config=${path.join(repoRoot, 'bunfig.toml')}`,
          `--cwd=${repoRoot}`,
          'test',
          ...parallelArgs,
          `--timeout=${TEST_TIMEOUT_MS}`,
          ...reporterArgs('bun', repoRoot),
          // Without `./`, bun treats each path as a substring filter and scans the whole repository for matching test files.
          ...testFiles.map(
            (filename) => `./${path.join(definition.packageRoot, filename)}`
          ),
        ],
        repoRoot
      );
      return;
    }

    // Bun reads bunfig.toml from its cwd.
    queueBatch(path.join(packageRoot, 'bunfig.toml'), 'bun', [
      'test',
      ...parallelArgs,
      `--timeout=${TEST_TIMEOUT_MS}`,
      ...reporterArgs(),
      `--preload=${path.join(repoRoot, 'config/plite-source-test-setup.ts')}`,
      ...testFiles.map((filename) => `./${filename}`),
    ]);
  };

  const queueBunTests = (testFiles) => {
    const isolatedFiles = testFiles.filter((filename) =>
      usesMockModule(path.join(packageRoot, filename))
    );
    const sharedFiles = testFiles.filter(
      (filename) => !isolatedFiles.includes(filename)
    );

    if (sharedFiles.length > 0) queueBunTestBatch(sharedFiles);

    if (
      isolatedFiles.length > 1 &&
      bunParallelWorkers(isolatedFiles.length, { isolated: true }) > 1
    ) {
      queueBunTestBatch(isolatedFiles, { isolated: true });
    } else {
      // Bun module mocks outlive an individual test file in a shared process.
      for (const filename of isolatedFiles) queueBunTestBatch([filename]);
    }
  };

  const suiteOf = (filename) =>
    vitestSuiteOf(
      packageName,
      partitionOf.get(path.join(packageRoot, filename)),
      filename
    );
  const bunFiles = files.filter((filename) => !suiteOf(filename));
  if (bunFiles.length > 0) queueBunTests(bunFiles);

  for (const suite of vitestSuites[packageName] ?? []) {
    const vitestFiles = files.filter((filename) => suiteOf(filename) === suite);

    if (vitestFiles.length === 0) continue;

    queueBatch(path.join(packageRoot, suite.config), 'pnpm', [
      'exec',
      'vitest',
      'run',
      '--config',
      `./${suite.config}`,
      `--testTimeout=${TEST_TIMEOUT_MS}`,
      ...vitestParallelArgs(suite),
      ...reporterArgs('vitest'),
      ...suite.args,
      ...vitestFiles,
    ]);
  }

  const buffered = batches.length > 1;
  const batchStatuses = await Promise.all(
    batches.map(({ args, cwd, env, executable }) =>
      runProcessAsync(executable, args, cwd, env, { buffered })
    )
  );

  return batchStatuses.find((status) => status !== 0) ?? 0;
};

const runTestTask = async () => {
  const only = new Set(onlyFiles.map((file) => path.resolve(repoRoot, file)));
  const partitionOf = new Map(
    partitionNames.flatMap((name) =>
      getPackageRuntimeTestFiles(packageName, name)
        .filter((file) => only.size === 0 || only.has(file))
        .map((file) => [file, name])
    )
  );
  const filesOutsidePartitions = onlyFiles.filter(
    (file) => !partitionOf.has(path.resolve(repoRoot, file))
  );

  if (filesOutsidePartitions.length > 0) {
    for (const file of filesOutsidePartitions) {
      const fromRoot = path.relative(repoRoot, path.resolve(packageRoot, file));

      console.error(
        `No test file of ${packageName} ${partitionList} is at ${file}. Name each file from the repository root${existsSync(path.join(repoRoot, fromRoot)) ? `, such as ${fromRoot}` : ''}.`
      );
    }

    return 1;
  }

  const testFiles = [...partitionOf.keys()];
  const run = (traceEnv) => runTests(testFiles, partitionOf, traceEnv);
  const turboTaskId =
    partitionNames.length === 1
      ? `${packageName}#test:partition:${partitionNames[0]}`
      : null;

  return turboTaskId
    ? await runTraced({ taskId: turboTaskId, testFiles }, run)
    : await run(() => process.env);
};

process.exit(command === 'lint' ? runLint() : await runTestTask());
