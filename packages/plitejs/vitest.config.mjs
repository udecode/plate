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
      'plitejs/pagination': path.resolve(
        import.meta.dirname,
        './src/pagination/index.ts'
      ),
      'plitejs/pagination/react': path.resolve(
        import.meta.dirname,
        './src/pagination/react.tsx'
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
