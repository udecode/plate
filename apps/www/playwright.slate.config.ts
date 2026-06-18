import * as os from 'node:os';

import { devices, type PlaywrightTestConfig } from '@playwright/test';

const explicitBaseURL = process.env.PLAYWRIGHT_BASE_URL;
const baseURL = explicitBaseURL ?? 'http://localhost:3100';

process.env.PLAYWRIGHT_BASE_URL = baseURL;

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
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  outputDir: './test-results/slate-browser',
  projects,
  reporter: process.env.CI ? 'github' : 'list',
  retries: process.env.CI ? 2 : 0,
  testDir: './tests/slate-browser',
  timeout: 45_000,
  use: {
    actionTimeout: 10_000,
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
        command: 'PORT=3100 pnpm dev',
        reuseExistingServer: !process.env.CI,
        timeout: 300_000,
        url: baseURL,
      },
  workers: 1,
};

export default config;
