import { defineDirectPackageConfig } from '../../tooling/config/direct-package.config.mts';

export default defineDirectPackageConfig(
  {
    entry: {
      index: 'src/index.ts',
      'diff/index': 'src/diff/index.ts',
      'dom/index': 'src/dom/index.ts',
      'history/index': 'src/history/index.ts',
      'hyperscript/index': 'src/hyperscript/index.ts',
      'page-layout/index': 'src/page-layout/index.ts',
      'page-layout/react': 'src/page-layout/react.tsx',
      'react/index': 'src/react/index.ts',
      'testing/index': 'src/testing/index.ts',
    },
  },
  {
    runtimeImportBoundaries: [
      {
        entry: 'dist/index.js',
        forbiddenPackages: ['react', 'react-dom'],
      },
      {
        entry: 'dist/page-layout/index.js',
        forbiddenPackages: ['react', 'react-dom'],
      },
    ],
  }
);
