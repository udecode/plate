import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

import { loadTrace } from '../../tooling/config/vitest-load-trace.mjs';

export default defineConfig({
  test: {
    projects: [
      {
        // Inline projects do not inherit root plugins.
        plugins: [loadTrace()],
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
