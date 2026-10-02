import { defineConfig } from '@playwright/test';

const port = Number(process.env.PLATE_NATIVE_IME_PORT ?? 3311);

const nativeImeBaseURL = `http://localhost:${port}`;

export default defineConfig({
  forbidOnly: true,
  fullyParallel: false,
  globalSetup: './tests/native/global-setup.ts',
  repeatEach: 5,
  reporter: 'list',
  retries: 0,
  testDir: './tests/native',
  testMatch: /\.native\.ts$/,
  timeout: 90_000,
  use: { baseURL: nativeImeBaseURL },
  webServer: {
    command: `PLATE_WWW_PLITE=1 PLATE_WWW_DEV_SOURCE=1 PLATE_WWW_DIST_DIR=.next-native-ime next dev --port ${port}`,
    reuseExistingServer: false,
    timeout: 300_000,
    url: nativeImeBaseURL,
  },
  workers: 1,
});
