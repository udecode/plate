import { defineDirectPackageConfig } from '../../tooling/config/direct-package.config.mts';

export default defineDirectPackageConfig({
  entry: {
    bin: 'src/bin.ts',
    'evaluation-worker': 'src/evaluation-worker.ts',
  },
  platform: 'node',
});
