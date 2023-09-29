import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'tsup';

const PACKAGE_ROOT_PATH = process.cwd();
const INPUT_FILE_PATH = path.join(PACKAGE_ROOT_PATH, 'src/index.ts');
const INPUT_FILE = fs.existsSync(INPUT_FILE_PATH)
  ? INPUT_FILE_PATH
  : path.join(PACKAGE_ROOT_PATH, 'src/index.tsx');

export default defineConfig((opts) => {
  return {
    ...opts,
      entry: [INPUT_FILE],
  format: ['cjs', 'esm'],
  external: [],
  skipNodeModulesBundle: true,
  dts: true,
  sourcemap: true,
  clean: true,
  minify: false,
    outExtension: ({ format }) => {
      return {
        js: format === 'cjs' ? '.js' : '.es.js',
      };
    },
    onSuccess: async () => {
      if (opts.watch) {
        console.log('Watching for changes...');

        return;
      }

      console.log('Build succeeded!');
    },

    silent: true,
  };
});