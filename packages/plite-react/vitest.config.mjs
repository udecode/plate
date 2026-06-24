import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@platejs/plite/internal': path.resolve(
        import.meta.dirname,
        '../plite/src/internal/index.ts'
      ),
      '@platejs/plite': path.resolve(
        import.meta.dirname,
        '../plite/src/index.ts'
      ),
      '@platejs/plite-dom/internal': path.resolve(
        import.meta.dirname,
        '../plite-dom/src/internal/index.ts'
      ),
      '@platejs/plite-dom': path.resolve(
        import.meta.dirname,
        '../plite-dom/src/index.ts'
      ),
      '@platejs/plite-history': path.resolve(
        import.meta.dirname,
        '../plite-history/src/index.ts'
      ),
      '@platejs/plite-hyperscript': path.resolve(
        import.meta.dirname,
        '../plite-hyperscript/src/index.ts'
      ),
      '@platejs/plite-react': path.resolve(
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
