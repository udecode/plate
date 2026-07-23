import fs from 'node:fs';
import path from 'node:path';
import pluginBabel from '@rollup/plugin-babel';
import { convertPathToPattern } from 'tinyglobby';
import { defineConfig } from 'tsdown';

import { withDirectPackageConfig } from './direct-package.config.mts';

export const resolvePlatePackageRoot = ({
  cwd = process.cwd(),
  initCwd = process.env.INIT_CWD,
}: {
  cwd?: string;
  initCwd?: string;
} = {}) => {
  const packageRoot = [cwd, initCwd]
    .filter((candidate): candidate is string => !!candidate)
    .map((candidate) => path.resolve(candidate))
    .find(
      (candidate) =>
        fs.existsSync(path.join(candidate, 'package.json')) &&
        (fs.existsSync(path.join(candidate, 'src/index.ts')) ||
          fs.existsSync(path.join(candidate, 'src/index.tsx')))
    );

  if (!packageRoot) {
    throw new Error(
      `Could not resolve a package root from: ${[cwd, initCwd]
        .filter(Boolean)
        .join(', ')}`
    );
  }

  return packageRoot;
};

const PACKAGE_ROOT_PATH = resolvePlatePackageRoot();
const TS_FILE_RE = /\.ts$/;
const TSX_FILE_RE = /\.tsx$/;

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

export const createPlatePackageConfig = ({
  additionalEntries = [],
  directDeclarations = false,
}: {
  additionalEntries?: string[];
  directDeclarations?: boolean;
} = {}) =>
  defineConfig((opts) => {
    const config = {
      ...opts,
      cwd: PACKAGE_ROOT_PATH,
      deps: { neverBundle: true },
      entry: [
        ...entry,
        ...additionalEntries.map((input) =>
          convertPathToPattern(path.join(PACKAGE_ROOT_PATH, input))
        ),
      ],
      platform: 'neutral',
      tsconfig: 'tsconfig.build.json',
      sourcemap: enableSourcemaps,
      dts: false,
      exports: false,
      failOnWarn: 'ci-only',
      plugins: [
        pluginBabel({
          babelHelpers: 'bundled',
          exclude: '**/static/**',
          overrides: [
            {
              parserOpts: {
                plugins: ['typescript'],
                sourceType: 'module',
              },
              test: TS_FILE_RE,
            },
            {
              parserOpts: {
                plugins: [['typescript', { isTSX: true }], 'jsx'],
                sourceType: 'module',
              },
              test: TSX_FILE_RE,
            },
          ],
          plugins: [['babel-plugin-react-compiler', { target: '18' }]],
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        }),
      ],
    };

    return [directDeclarations ? withDirectPackageConfig(config) : config];
  });

export default createPlatePackageConfig();
