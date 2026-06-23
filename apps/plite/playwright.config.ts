import * as os from 'node:os';

import { devices, type PlaywrightTestConfig } from '@playwright/test';

const explicitBaseURL = process.env.PLAYWRIGHT_BASE_URL;
const baseURL = explicitBaseURL ?? 'http://localhost:3102';
process.env.PLAYWRIGHT_BASE_URL = baseURL;
const availableParallelism = os.availableParallelism?.() ?? os.cpus().length;
const localWorkerCount = Math.min(10, Math.max(2, availableParallelism - 2));
const workerCount = process.env.PLAYWRIGHT_WORKERS
  ? Number(process.env.PLAYWRIGHT_WORKERS)
  : process.env.CI
    ? undefined
    : localWorkerCount;
const retryCount = process.env.PLAYWRIGHT_RETRIES
  ? Number(process.env.PLAYWRIGHT_RETRIES)
  : process.env.CI
    ? 5
    : 2;

const projects: PlaywrightTestConfig['projects'] = [
  {
    name: 'chromium',
    use: {
      ...devices['Desktop Chrome'],
      launchOptions: {
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
  fullyParallel: !process.env.CI,
  forbidOnly: !!process.env.CI,
  outputDir: './test-results/plite-browser',
  projects,
  reporter: process.env.CI ? 'github' : 'list',
  retries: retryCount,
  testDir: './tests/plite-browser',
  timeout: 45_000,
  use: {
    actionTimeout: 0,
    baseURL,
    screenshot: 'only-on-failure',
    testIdAttribute: 'data-test-id',
    trace: 'retain-on-first-failure',
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
