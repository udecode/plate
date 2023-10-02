import fs from 'node:fs';
import path from 'node:path';
import { esbuildPluginImport } from '@linjiajian999/esbuild-plugin-import';
import { esbuildPluginFilePathExtensions } from 'esbuild-plugin-file-path-extensions';
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
    skipNodeModulesBundle: true,
    dts: true,
    sourcemap: true,
    clean: true,
    esbuildPlugins: [
      esbuildPluginFilePathExtensions({ esmExtension: 'js' }) as any,
      esbuildPluginImport([
        {
          libraryName: 'lodash',
          libraryDirectory: '',
          camel2DashComponentName: false,
        },
      ]) as any,
    ],
    onSuccess: async () => {
      if (opts.watch) {
        console.info('Watching for changes...');
        return;
      }

      console.info('Build succeeded!');
    },
    silent: true,
  };
});
