import { defineDirectPackageConfig } from '../../tooling/config/direct-package.config.mts';

export default defineDirectPackageConfig({
  entry: {
    bin: 'src/bin.ts',
    'compile-worker': 'src/compile-worker.ts',
    index: 'src/index.ts',
  },
  platform: 'node',
});
