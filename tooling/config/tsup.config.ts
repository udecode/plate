/* eslint-disable unicorn/prefer-module,@typescript-eslint/no-shadow */
import fs from 'node:fs';
import path from 'node:path';
import { type Options, defineConfig } from 'tsup';

const silent = false;

const PACKAGE_ROOT_PATH = process.cwd();

const INPUT_TS_FILE_PATH = path.join(PACKAGE_ROOT_PATH, 'src/index.ts');
const INPUT_TSX_FILE_PATH = path.join(PACKAGE_ROOT_PATH, 'src/index.tsx');
const INPUT_FILE = fs.existsSync(INPUT_TS_FILE_PATH)
  ? INPUT_TS_FILE_PATH
  : INPUT_TSX_FILE_PATH;

const REACT_TS_INPUT_FILE_PATH = path.join(PACKAGE_ROOT_PATH, 'src/react/index.ts');
const REACT_TSX_INPUT_FILE_PATH = path.join(PACKAGE_ROOT_PATH, 'src/react/index.tsx');
const REACT_INPUT_FILE_PATH = fs.existsSync(REACT_TS_INPUT_FILE_PATH)
  ? REACT_TS_INPUT_FILE_PATH
  : REACT_TSX_INPUT_FILE_PATH;

const entry = [INPUT_FILE]

if (fs.existsSync(REACT_INPUT_FILE_PATH)) {
  entry.push(REACT_INPUT_FILE_PATH)
}

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
      entry,
    },
  ];
});
