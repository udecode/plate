import { defineConfig } from 'tsdown';

const enableSourcemaps = !process.env.CI;

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    react: 'src/react.tsx',
  },
  format: ['esm'],
  clean: true,
  platform: 'neutral',
  tsconfig: 'tsconfig.json',
  sourcemap: enableSourcemaps,
  dts: false,
  outExtensions: () => ({
    js: '.js',
  }),
});
