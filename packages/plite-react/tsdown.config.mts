import { defineDirectPackageConfig } from '../../tooling/config/direct-package.config.mts';

export default defineDirectPackageConfig({
  entry: {
    index: 'src/index.ts',
    'internal/index': 'src/internal/index.ts',
  },
});
