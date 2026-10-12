import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      {
        // Playwright-side harness code reads the host platform, and this
        // project runs it in the page.
        define: { 'process.platform': JSON.stringify(process.platform) },
        test: {
          name: 'browser',
          include: ['test/browser/**/*.browser.test.ts'],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
            screenshotFailures: false,
          },
        },
      },
    ],
  },
});
