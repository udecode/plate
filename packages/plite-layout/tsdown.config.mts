import { defineDirectPackageConfig } from '../../tooling/config/direct-package.config.mts';

export default defineDirectPackageConfig({
  entry: {
    index: 'src/index.ts',
    react: 'src/react.tsx',
  },
  tsconfig: 'tsconfig.json',
});
