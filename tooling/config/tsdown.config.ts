import fs from 'node:fs';
import path from 'node:path';
import pluginBabel from '@rollup/plugin-babel';
import { convertPathToPattern } from 'tinyglobby';
import { defineConfig } from 'tsdown';

const PACKAGE_ROOT_PATH = process.cwd();

const INPUT_TS_FILE_PATH = path.join(PACKAGE_ROOT_PATH, 'src/index.ts');
const INPUT_TSX_FILE_PATH = path.join(PACKAGE_ROOT_PATH, 'src/index.tsx');
const INPUT_FILE = fs.existsSync(INPUT_TS_FILE_PATH)
  ? INPUT_TS_FILE_PATH
  : INPUT_TSX_FILE_PATH;

const REACT_TS_INPUT_FILE_PATH = path.join(
  PACKAGE_ROOT_PATH,
  'src/react/index.ts'
);
const REACT_TSX_INPUT_FILE_PATH = path.join(
  PACKAGE_ROOT_PATH,
  'src/react/index.tsx'
);
const REACT_INPUT_FILE_PATH = fs.existsSync(REACT_TS_INPUT_FILE_PATH)
  ? REACT_TS_INPUT_FILE_PATH
  : REACT_TSX_INPUT_FILE_PATH;

const STATIC_TS_INPUT_FILE_PATH = path.join(
  PACKAGE_ROOT_PATH,
  'src/static/index.ts'
);
const STATIC_TSX_INPUT_FILE_PATH = path.join(
  PACKAGE_ROOT_PATH,
  'src/static/index.tsx'
);
const STATIC_INPUT_FILE_PATH = fs.existsSync(STATIC_TS_INPUT_FILE_PATH)
  ? STATIC_TS_INPUT_FILE_PATH
  : STATIC_TSX_INPUT_FILE_PATH;

const entry = [convertPathToPattern(INPUT_FILE)];

if (fs.existsSync(REACT_INPUT_FILE_PATH)) {
  entry.push(convertPathToPattern(REACT_INPUT_FILE_PATH));
}

if (fs.existsSync(STATIC_INPUT_FILE_PATH)) {
  entry.push(convertPathToPattern(STATIC_INPUT_FILE_PATH));
}

// Disable sourcemaps in CI to speed up builds
const enableSourcemaps = !process.env.CI;

export default defineConfig((opts) => [
  {
    ...opts,
    entry,
    platform: 'neutral',
    tsconfig: 'tsconfig.build.json',
    sourcemap: enableSourcemaps,
    dts: { sourcemap: enableSourcemaps },
    exports: true,
    plugins: [
      pluginBabel({
        babelHelpers: 'bundled',
        parserOpts: {
          sourceType: 'module',
          plugins: ['jsx', 'typescript'],
        },
        plugins: ['babel-plugin-react-compiler'],
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      }),
    ],
  },
]);
