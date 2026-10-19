import { defineDirectPackageConfig } from '../../tooling/config/direct-package.config.mts';

export default defineDirectPackageConfig({
  entry: {
    index: 'src/index.ts',
    'browser/index': 'src/browser/index.ts',
    'playwright/index': 'src/playwright/index.ts',
    'proof/index': 'src/proof/index.ts',
    'react/index': 'src/react/index.ts',
  },
  platform: 'node',
});
