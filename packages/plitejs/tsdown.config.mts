import { defineDirectPackageConfig } from '../../tooling/config/direct-package.config.mts';

export default defineDirectPackageConfig(
  {
    entry: {
      index: 'src/index.ts',
      'annotations/index': 'src/annotations/index.ts',
      'authored/index': 'src/authored/index.ts',
      'diff/index': 'src/diff/index.ts',
      'dom/index': 'src/dom/index.ts',
      'history/index': 'src/history/index.ts',
      'hyperscript/index': 'src/hyperscript/index.ts',
      'pagination/index': 'src/pagination/index.ts',
      'pagination/react': 'src/pagination/react.tsx',
      'react/index': 'src/react/index.ts',
      'testing/index': 'src/testing/index.ts',
      'yjs/index': 'src/yjs/index.ts',
      'yjs/react/index': 'src/yjs/react/index.ts',
    },
  },
  {
    runtimeImportBoundaries: [
      {
        entry: 'dist/index.js',
        forbiddenPackages: ['react', 'react-dom'],
      },
      {
        entry: 'dist/pagination/index.js',
        forbiddenPackages: ['react', 'react-dom'],
      },
    ],
  }
);
