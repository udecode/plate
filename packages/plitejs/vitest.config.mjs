import path from 'node:path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      'plitejs/diff': path.resolve(import.meta.dirname, './src/diff/index.ts'),
      'plitejs/dom': path.resolve(import.meta.dirname, './src/dom/index.ts'),
      'plitejs/history': path.resolve(
        import.meta.dirname,
        './src/history/index.ts'
      ),
      'plitejs/hyperscript': path.resolve(
        import.meta.dirname,
        './src/hyperscript/index.ts'
      ),
      'plitejs/page-layout': path.resolve(
        import.meta.dirname,
        './src/page-layout/index.ts'
      ),
      'plitejs/page-layout/react': path.resolve(
        import.meta.dirname,
        './src/page-layout/react.tsx'
      ),
      'plitejs/react': path.resolve(
        import.meta.dirname,
        './src/react/index.ts'
      ),
      'plitejs/testing': path.resolve(
        import.meta.dirname,
        './src/testing/index.ts'
      ),
      plitejs: path.resolve(import.meta.dirname, './src/index.ts'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['test/react/**/*.test.{ts,tsx}'],
    setupFiles: ['./test/react/vitest-setup.ts'],
  },
});
