import { defineDirectPackageConfig } from '../../tooling/config/direct-package.config.mts';

export default defineDirectPackageConfig({
  entry: {
    'browser/index': 'src/browser/index.ts',
    'core/index': 'src/core/index.ts',
    'playwright/index': 'src/playwright/index.ts',
    'transports/index': 'src/transports/index.ts',
  },
  platform: 'node',
});
