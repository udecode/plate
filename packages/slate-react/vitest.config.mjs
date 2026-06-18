import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@platejs/slate/internal': path.resolve(
        import.meta.dirname,
        '../slate/src/internal/index.ts'
      ),
      '@platejs/slate': path.resolve(
        import.meta.dirname,
        '../slate/src/index.ts'
      ),
      slate: path.resolve(import.meta.dirname, '../slate/src/index.ts'),
      '@platejs/slate-dom/internal': path.resolve(
        import.meta.dirname,
        '../slate-dom/src/internal/index.ts'
      ),
      '@platejs/slate-dom': path.resolve(
        import.meta.dirname,
        '../slate-dom/src/index.ts'
      ),
      '@platejs/slate-history': path.resolve(
        import.meta.dirname,
        '../slate-history/src/index.ts'
      ),
      '@platejs/slate-hyperscript': path.resolve(
        import.meta.dirname,
        '../slate-hyperscript/src/index.ts'
      ),
      '@platejs/slate-react': path.resolve(
        import.meta.dirname,
        './src/index.ts'
      ),
    },
  },
  test: {
    environment: 'jsdom',
    exclude: ['test/bun/**'],
    globals: true,
    include: ['test/**/*.test.{ts,tsx}'],
    setupFiles: ['./test/vitest-setup.ts'],
  },
});
