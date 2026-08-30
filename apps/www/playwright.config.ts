import { defineConfig, devices } from '@playwright/test';

const explicitBaseURL = process.env.PLAYWRIGHT_BASE_URL;
const baseURL = explicitBaseURL ?? 'http://localhost:3000';
const chromiumExecutablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;

export default defineConfig({
  expect: {
    timeout: 8000,
  },
  forbidOnly: !!process.env.CI,
  fullyParallel: false,
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
      },
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
