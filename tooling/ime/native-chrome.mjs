// Launches exact Google Chrome for native IME proof with only the switches the
// lane allows, so paint and input match a user's browser.

import { execFileSync, spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

const GOOGLE_CHROME =
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const ALLOWED_CHROME_SWITCHES = new Set([
  '--remote-debugging-port',
  '--user-data-dir',
  '--no-first-run',
  '--no-default-browser-check',
]);

const sleep = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

// Chrome writes the port it picked for --remote-debugging-port=0 into the
// profile, so the endpoint is this Chrome's even when another holds a port.
const waitForEndpoint = async (portFile, child, timeoutMs) => {
  const deadline = Date.now() + timeoutMs;
  let lastError;

  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(
        'Chrome exited at launch; another Chrome may hold the lane profile'
      );
    }
    if (existsSync(portFile)) {
      const port = Number(readFileSync(portFile, 'utf-8').split('\n')[0]);

      try {
        const response = await fetch(`http://127.0.0.1:${port}/json/version`);
        if (response.ok) return { port, version: await response.json() };
      } catch (error) {
        lastError = error;
      }
    }
    await sleep(100);
  }

  throw new Error('Chrome DevTools did not answer', { cause: lastError });
};

const readProcessArgs = (pid) =>
  execFileSync('ps', ['-o', 'args=', '-p', String(pid)], {
    encoding: 'utf-8',
  }).trim();

const assertAllowedSwitches = (args) => {
  const extra = args
    .split(/\s+/)
    .filter((part) => part.startsWith('--'))
    .map((part) => part.split('=')[0])
    .filter((name) => !ALLOWED_CHROME_SWITCHES.has(name));

  if (extra.length) {
    throw new Error(`Chrome runs with unexpected switches: ${extra.join(' ')}`);
  }
};

export const launchNativeChrome = async ({
  profile = join(here, '../../node_modules/.cache/plate-proof/chrome-profile'),
} = {}) => {
  const portFile = join(profile, 'DevToolsActivePort');

  mkdirSync(profile, { recursive: true });
  rmSync(portFile, { force: true });

  const child = spawn(
    GOOGLE_CHROME,
    [
      '--remote-debugging-port=0',
      `--user-data-dir=${profile}`,
      '--no-first-run',
      '--no-default-browser-check',
      'about:blank',
    ],
    { stdio: 'ignore' }
  );
  const { pid } = child;

  if (pid === undefined) {
    throw new Error(`Could not start ${GOOGLE_CHROME}`);
  }

  let endpoint;
  let args;

  try {
    endpoint = await waitForEndpoint(portFile, child, 20_000);
    args = readProcessArgs(pid);
    assertAllowedSwitches(args);
  } catch (error) {
    child.kill('SIGTERM');
    throw error;
  }

  return {
    args,
    browser: endpoint.version.Browser,
    endpoint: `http://127.0.0.1:${endpoint.port}`,
    pid,
  };
};
