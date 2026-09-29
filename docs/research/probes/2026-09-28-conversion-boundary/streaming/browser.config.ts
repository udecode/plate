import { defineConfig } from '@playwright/test';
import base from '../../../../../apps/www/playwright.config';

export default defineConfig({
  ...base,
  testDir: __dirname,
  testMatch: 'browser.spec.ts',
  outputDir: `${__dirname}/browser-test-results`,
  reporter: [['list']],
  webServer: undefined,
  timeout: 60_000,
  retries: 0,
  workers: 1,
  use: { ...base.use, baseURL: 'http://localhost:3297', trace: 'retain-on-failure' },
});
