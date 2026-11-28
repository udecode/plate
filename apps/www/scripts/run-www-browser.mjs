#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createServer } from 'node:net';
import path from 'node:path';

const appRoot = path.resolve(import.meta.dirname, '..');
const [project, ...rawArgs] = process.argv.slice(2);

if (!project) {
  console.error('Usage: node scripts/run-www-browser.mjs <project> [args...]');
  process.exit(1);
}

const passthroughArgs = rawArgs[0] === '--' ? rawArgs.slice(1) : rawArgs;
const require = createRequire(import.meta.url);
const playwrightPackagePath = require.resolve('@playwright/test/package.json');
const playwrightCli = path.join(path.dirname(playwrightPackagePath), 'cli.js');

const allocateFreePort = () =>
  new Promise((resolve, reject) => {
    const server = createServer();
    server.unref();
    server.once('error', reject);
    server.listen(0, () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : 0;
      server.close((error) => {
        if (error) reject(error);
        else resolve(port);
      });
    });
  });

const allocatedPort =
  !process.env.PLAYWRIGHT_BASE_URL && !process.env.PLAYWRIGHT_PORT
    ? await allocateFreePort()
    : null;
const ephemeralDistDir =
  allocatedPort !== null && !process.env.PLATE_WWW_DIST_DIR
    ? path.join(appRoot, `.next-plite-${allocatedPort}`)
    : null;

const child = spawn(
  process.execPath,
  [
    playwrightCli,
    'test',
    '--config',
    'playwright.config.ts',
    `--project=${project}`,
    ...passthroughArgs,
  ],
  {
    cwd: appRoot,
    env: {
      ...process.env,
      ...(allocatedPort !== null
        ? { PLAYWRIGHT_PORT: String(allocatedPort) }
        : {}),
    },
    stdio: 'inherit',
  }
);

const forwardSignal = (signal) => {
  if (child.exitCode === null && child.signalCode === null) {
    child.kill(signal);
  }
};

process.once('SIGINT', () => forwardSignal('SIGINT'));
process.once('SIGTERM', () => forwardSignal('SIGTERM'));

child.once('error', (error) => {
  if (ephemeralDistDir) {
    rmSync(ephemeralDistDir, { force: true, recursive: true });
  }
  console.error(error);
  process.exit(1);
});

child.once('close', (code, signal) => {
  if (ephemeralDistDir) {
    rmSync(ephemeralDistDir, { force: true, recursive: true });
  }
  if (signal === 'SIGINT') process.exit(130);
  if (signal === 'SIGTERM') process.exit(143);
  process.exit(code ?? 1);
});
