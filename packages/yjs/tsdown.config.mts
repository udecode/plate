import { defineDirectPackageConfig } from '../../tooling/config/direct-package.config.mts';

export default defineDirectPackageConfig({
  entry: {
    index: 'src/index.ts',
    'plate/index': 'src/plate/index.ts',
    'react/index': 'src/react/index.ts',
  },
});
