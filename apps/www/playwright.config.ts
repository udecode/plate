import * as os from 'node:os';
import * as path from 'node:path';

import type { BrowserTestOptions } from '@platejs/test/playwright';
import { defineConfig, devices } from '@playwright/test';

const explicitBaseURL = process.env.PLAYWRIGHT_BASE_URL;
const baseURL = explicitBaseURL ?? 'http://localhost:3000';
const chromiumExecutablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;

export default defineConfig<BrowserTestOptions>({
  expect: {
    timeout: 8000,
  },
  forbidOnly: !!process.env.CI,
  fullyParallel: false,
  globalSetup: './tests/browser/global-setup.ts',
  projects: [
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
        clipboardTransport: 'native',
        permissions: ['clipboard-read', 'clipboard-write'],
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        clipboardTransport: 'native',
        launchOptions: {
          // Playwright's Firefox shares the installed Firefox's app-data dir,
          // which macOS 27 privacy-protects, and hangs at launch reading it.
          env: {
            ...process.env,
            MOZ_APP_DATA: path.join(os.tmpdir(), 'playwright-firefox-app-data'),
          },
        },
      },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'], clipboardTransport: 'event' },
    },
  ],
  reporter: process.env.CI ? 'github' : 'list',
  retries: 0,
  testDir: './tests/browser',
  timeout: 45_000,
  use: {
    baseURL,
    screenshot: 'only-on-failure',
    trace: 'off',
    viewport: {
      height: 720,
      width: 1280,
    },
  },
  webServer: explicitBaseURL
    ? undefined
    : {
        command: 'pnpm dev:plite',
        reuseExistingServer: true,
        timeout: 300_000,
        url: baseURL,
      },
  workers: 1,
});
