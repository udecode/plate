/* eslint-disable unicorn/prefer-module,@typescript-eslint/no-shadow */
import fs from 'node:fs';
import path from 'node:path';
import { type Options, defineConfig } from 'tsup';

const silent = false;

const PACKAGE_ROOT_PATH = process.cwd();
const INPUT_FILE_PATH = path.join(PACKAGE_ROOT_PATH, 'src/index.ts');
const INPUT_FILE = fs.existsSync(INPUT_FILE_PATH)
  ? INPUT_FILE_PATH
  : path.join(PACKAGE_ROOT_PATH, 'src/index.tsx');

const SERVER_INPUT_FILE_PATH = path.join(PACKAGE_ROOT_PATH, 'src/server.ts');

export default defineConfig((opts) => {
  const options: Options = {
    ...opts,
    clean: true,
    dts: true,
    format: ['cjs', 'esm'],
    sourcemap: true,
    splitting: false,
    ...(silent
      ? {
          // eslint-disable-next-line @typescript-eslint/require-await
          onSuccess: async () => {
            if (opts.watch) {
              console.info('Watching for changes...');

              return;
            }

            console.info('Build succeeded!');
          },
          silent: true,
        }
      : {}),
  };

  return [
    {
      ...options,
      entry: fs.existsSync(SERVER_INPUT_FILE_PATH)
        ? [INPUT_FILE, SERVER_INPUT_FILE_PATH]
        : [INPUT_FILE],
    },
  ];
});
