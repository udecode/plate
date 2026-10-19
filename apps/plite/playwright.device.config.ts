import { defineConfig } from '@playwright/test';

import { listSerials } from '../../packages/test/src/device/android';
import {
  assertBrowserWorkerArgs,
  assertRetryFreeBrowserArgs,
} from './scripts/plite-browser-runner.mjs';
import { deviceAppPort } from './tests/device/port';

assertRetryFreeBrowserArgs(process.argv);
assertBrowserWorkerArgs(process.argv);

const serials = process.env.PLATE_DEVICE_SERIALS
  ? process.env.PLATE_DEVICE_SERIALS.split(',')
  : listSerials();

export default defineConfig<object, { deviceSerial: string }>({
  forbidOnly: true,
  fullyParallel: false,
  globalSetup: './tests/device/global-setup.ts',
  outputDir: './test-results/device-artifacts',
  projects: serials.map((serial) => ({
    name: `device-${serial}`,
    use: { deviceSerial: serial },
  })),
  repeatEach: Number(process.env.PLATE_DEVICE_REPEAT ?? 5),
  // The JSON report keeps each run's known-failure and witness annotations.
  reporter: [
    ['list'],
    ['json', { outputFile: 'test-results/device/report.json' }],
  ],
  retries: 0,
  testDir: './tests/device',
  testMatch: /\.device\.ts$/,
  timeout: 180_000,
  use: {
    screenshot: 'off',
    testIdAttribute: 'data-test-id',
    trace: 'off',
    video: 'off',
  },
  webServer: {
    command: `node scripts/build-app-if-stale.mjs && PORT=${deviceAppPort} node scripts/serve.mjs`,
    reuseExistingServer: false,
    timeout: 900_000,
    url: `http://127.0.0.1:${deviceAppPort}`,
  },
  workers: 1,
});
