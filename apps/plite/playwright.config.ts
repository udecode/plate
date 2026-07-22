import * as os from 'node:os';

import { devices, type PlaywrightTestConfig } from '@playwright/test';

import {
  assertBrowserWorkerArgs,
  MAX_BROWSER_WORKERS,
  resolvePliteBrowserBaseURL,
  resolveBrowserWorkerCount,
} from './scripts/plite-browser-runner.mjs';

const explicitBaseURL = process.env.PLAYWRIGHT_BASE_URL;
const baseURL = resolvePliteBrowserBaseURL(explicitBaseURL);
const chromiumExecutablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
process.env.PLAYWRIGHT_BASE_URL = baseURL;
assertBrowserWorkerArgs(process.argv);
const availableParallelism = os.availableParallelism?.() ?? os.cpus().length;
const localWorkerCount = Math.min(
  MAX_BROWSER_WORKERS,
  Math.max(2, availableParallelism - 2)
);
const workerCount = process.env.PLAYWRIGHT_WORKERS
  ? resolveBrowserWorkerCount(
      process.env.PLAYWRIGHT_WORKERS,
      'PLAYWRIGHT_WORKERS'
    )
  : process.env.CI
    ? undefined
    : localWorkerCount;
const fullyParallel =
  process.env.PLITE_BROWSER_FULLY_PARALLEL === '1' || !process.env.CI;
const jsonOutput = process.env.PLITE_BROWSER_JSON_OUTPUT;
const outputDir =
  process.env.PLITE_BROWSER_OUTPUT_DIR ?? './test-results/plite-browser';

const projects: PlaywrightTestConfig['projects'] = [
  {
    name: 'chromium',
    use: {
      ...devices['Desktop Chrome'],
      launchOptions: {
        ...(chromiumExecutablePath
          ? { executablePath: chromiumExecutablePath }
          : {}),
        ignoreDefaultArgs: ['--hide-scrollbars'],
      },
      permissions: ['clipboard-read', 'clipboard-write'],
    },
  },
  {
    name: 'firefox',
    use: {
      ...devices['Desktop Firefox'],
    },
  },
  {
    name: 'mobile',
    use: {
      ...devices['Pixel 5'],
      ...(chromiumExecutablePath
        ? { launchOptions: { executablePath: chromiumExecutablePath } }
        : {}),
      permissions: ['clipboard-read', 'clipboard-write'],
    },
  },
];

if (os.type() === 'Darwin') {
  projects.push({
    name: 'webkit',
    use: {
      ...devices['Desktop Safari'],
    },
  });
}

const config: PlaywrightTestConfig = {
  expect: {
    timeout: 8000,
  },
  fullyParallel,
  forbidOnly: !!process.env.CI,
  outputDir,
  projects,
  reporter: jsonOutput
    ? [['dot'], ['json', { outputFile: jsonOutput }]]
    : process.env.CI
      ? 'github'
      : 'list',
  retries: 0,
  testDir: './tests/plite-browser',
  timeout: 45_000,
  use: {
    actionTimeout: 0,
    baseURL,
    screenshot: 'only-on-failure',
    testIdAttribute: 'data-test-id',
    trace:
      process.env.PLITE_BROWSER_TRACE === '1'
        ? 'retain-on-first-failure'
        : 'off',
    viewport: {
      height: 720,
      width: 1280,
    },
  },
  webServer: explicitBaseURL
    ? undefined
    : {
        command: 'pnpm build && pnpm serve',
        reuseExistingServer: process.env.PLAYWRIGHT_REUSE_SERVER === '1',
        timeout: 300_000,
        url: baseURL,
      },
  workers:
    typeof workerCount === 'number' && Number.isFinite(workerCount)
      ? workerCount
      : undefined,
};

export default config;
