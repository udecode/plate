import { defineConfig } from 'tsdown';

const enableSourcemaps = !process.env.CI;

export default defineConfig({
  entry: {
    index: 'src/index.ts',
  },
  format: ['esm'],
  clean: true,
  platform: 'neutral',
  tsconfig: 'tsconfig.build.json',
  sourcemap: enableSourcemaps,
  dts: false,
  outExtensions: () => ({
    js: '.js',
  }),
});
