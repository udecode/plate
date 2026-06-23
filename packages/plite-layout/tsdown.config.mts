import { defineConfig } from 'tsdown';

const enableSourcemaps = !process.env.CI;
const dts = {
  bundle: true,
  sourcemap: enableSourcemaps,
  tsconfig: '../../tooling/config/tsconfig.build.json',
};

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
  dts,
  outExtensions: () => ({
    js: '.js',
  }),
});
