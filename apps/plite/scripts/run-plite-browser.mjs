#!/usr/bin/env node

import { spawn, spawnSync } from 'node:child_process';

const mode = process.argv[2] ?? 'matrix';
const passthroughArgs = process.argv.slice(3);
const paginationFile = 'tests/plite-browser/donor/examples/pagination.test.ts';
const syncedBlocksFile =
  'tests/plite-browser/donor/examples/synced-blocks.test.ts';
const checkListsFile = 'tests/plite-browser/donor/examples/check-lists.test.ts';
const baseArgs = [
  'exec',
  'playwright',
  'test',
  '--config',
  'playwright.config.ts',
];
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3102';
let serverProcess;

const hasReporterArg = (args) =>
  args.some((arg) => arg === '--reporter' || arg.startsWith('--reporter='));

const childEnv = (extra = {}) => {
  const env = {
    ...process.env,
    ...extra,
  };

  if ('NO_COLOR' in env) {
    env.NO_COLOR = undefined;
  }

  return env;
};

const run = (args) => {
  const reporterArgs = hasReporterArg(args) ? [] : ['--reporter=dot'];
  const result = spawnSync('pnpm', [...baseArgs, ...reporterArgs, ...args], {
    // Keep default local output compact. Callers can still pass --reporter=* for
    // verbose debugging.
    env: childEnv({
      PLAYWRIGHT_BASE_URL: baseURL,
    }),
    stdio: 'inherit',
  });

  if (result.error) {
    throw result.error;
  }

  return result.status ?? 1;
};

const runAsync = (args) =>
  new Promise((resolve, reject) => {
    const reporterArgs = hasReporterArg(args) ? [] : ['--reporter=dot'];
    const process = spawn('pnpm', [...baseArgs, ...reporterArgs, ...args], {
      env: childEnv({
        PLAYWRIGHT_BASE_URL: baseURL,
      }),
      stdio: 'inherit',
    });

    process.once('error', reject);
    process.once('exit', (code) => resolve(code ?? 1));
  });

const runSetup = () => {
  if (process.env.PLAYWRIGHT_BASE_URL) {
    return 0;
  }

  const buildResult = spawnSync(
    process.execPath,
    ['scripts/build-app-if-stale.mjs'],
    {
      env: childEnv(),
      stdio: 'inherit',
    }
  );

  if (buildResult.error) {
    throw buildResult.error;
  }

  if (buildResult.status !== 0) {
    return buildResult.status ?? 1;
  }

  serverProcess = spawn(process.execPath, ['scripts/serve.mjs'], {
    env: childEnv({
      PORT: new URL(baseURL).port || '3102',
    }),
    stdio: 'inherit',
  });

  return waitForServer();
};

const waitForServer = async () => {
  const deadline = Date.now() + 300_000;
  let lastError;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(baseURL, {
        signal: AbortSignal.timeout(1000),
      });

      if (response.ok || response.status < 500) {
        return 0;
      }
    } catch (error) {
      lastError = error;
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  console.error(
    `Timed out waiting for Plite proof server at ${baseURL}${
      lastError instanceof Error ? `: ${lastError.message}` : ''
    }`
  );

  return 1;
};

const stopServer = () => {
  if (!serverProcess || serverProcess.killed) {
    return;
  }

  serverProcess.kill('SIGTERM');
};

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => {
    stopServer();
    process.kill(process.pid, signal);
  });
}

const runDirect = (args) => run(args);

const runSplit = async (baseProjectArgs) => {
  const paginationProjectArgs =
    baseProjectArgs.length > 0 ? baseProjectArgs : ['--project=chromium'];
  const nonPaginationStatus = run([
    ...baseProjectArgs,
    '--grep-invert',
    'pagination example|synced blocks example|Check-lists example',
  ]);

  if (nonPaginationStatus !== 0) {
    return nonPaginationStatus;
  }

  const runChromiumTailInParallel =
    baseProjectArgs.length === 1 && baseProjectArgs[0] === '--project=chromium';

  if (runChromiumTailInParallel) {
    const checkListsStatus = run([
      ...baseProjectArgs,
      checkListsFile,
      '--workers=1',
    ]);

    if (checkListsStatus !== 0) {
      return checkListsStatus;
    }

    const [syncedBlocksStatus, paginationStatus] = await Promise.all([
      runAsync([...baseProjectArgs, syncedBlocksFile, '--workers=1']),
      runAsync([...paginationProjectArgs, paginationFile, '--workers=1']),
    ]);

    return syncedBlocksStatus !== 0 ? syncedBlocksStatus : paginationStatus;
  }

  const checkListsStatus = run([
    ...baseProjectArgs,
    checkListsFile,
    '--workers=1',
  ]);

  if (checkListsStatus !== 0) {
    return checkListsStatus;
  }

  const syncedBlocksStatus = run([
    ...baseProjectArgs,
    syncedBlocksFile,
    '--workers=1',
  ]);

  if (syncedBlocksStatus !== 0) {
    return syncedBlocksStatus;
  }

  return run([...paginationProjectArgs, paginationFile, '--workers=1']);
};

let status;

const setupStatus = await runSetup();

if (setupStatus !== 0) {
  status = setupStatus;
} else if (mode === 'matrix') {
  status =
    passthroughArgs.length > 0
      ? runDirect(passthroughArgs)
      : await runSplit([]);
} else if (mode === 'chromium') {
  status =
    passthroughArgs.length > 0
      ? runDirect(['--project=chromium', ...passthroughArgs])
      : await runSplit(['--project=chromium']);
} else if (mode === 'direct') {
  status = runDirect(passthroughArgs);
} else {
  console.error(
    `Unknown Plite browser test mode "${mode}". Expected matrix, chromium, or direct.`
  );
  status = 1;
}

stopServer();

process.exit(status);
