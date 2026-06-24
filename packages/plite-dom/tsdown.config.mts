import { defineConfig } from 'tsdown';

const enableSourcemaps = !process.env.CI;
const dts = {
  bundle: true,
  sourcemap: enableSourcemaps,
};

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'internal/index': 'src/internal/index.ts',
  },
  format: ['esm'],
  clean: true,
  platform: 'neutral',
  tsconfig: 'tsconfig.build.json',
  sourcemap: enableSourcemaps,
  dts,
  outExtensions: () => ({
    js: '.js',
  }),
});
