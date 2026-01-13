import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: [
    'react',
    'react-dom',
    'platejs',
    'jszip',
    'lucide-react',
    'sonner',
  ],
  treeshake: true,
  splitting: false,
});
