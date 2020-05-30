import path from 'path';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import includePaths from 'rollup-plugin-includepaths';
import json from 'rollup-plugin-json';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';
import resolve from 'rollup-plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';

const PACKAGE_ROOT_PATH = process.cwd();
const INPUT_FILE = path.join(PACKAGE_ROOT_PATH, 'src/index.ts');
const PKG_JSON = require(path.join(PACKAGE_ROOT_PATH, 'package.json'));

const isUmd = false;

const includePathOptions = {
  include: {},
  paths: [path.join(PACKAGE_ROOT_PATH, 'src')],
  external: [],
  extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
};

const plugins = [
  includePaths(includePathOptions),

  // Allow Rollup to resolve modules from `node_modules`, since it only
  // resolves local modules by default.
  resolve({
    browser: true,
  }),

  typescript({
    clean: true,
    tsconfig: 'tsconfig.build.json',
  }),

  // Allow Rollup to resolve CommonJS modules, since it only resolves ES2015
  // modules by default.
  commonjs({
    include: 'node_modules/**',
    namedExports: {
      'node_modules/react/index.js': [
        'cloneElement',
        'createContext',
        'Component',
        'createElement',
      ],
      'node_modules/react-dom/index.js': [
        'render',
        'hydrate',
        'renderToStaticMarkup',
      ],
      'node_modules/react-dom/server.js': ['renderToStaticMarkup'],
      'node_modules/react-is/index.js': [
        'isElement',
        'isValidElementType',
        'ForwardRef',
      ],
    },
  }),

  // Convert JSON imports to ES6 modules.
  json(),

  // Register Node.js builtins for browserify compatibility.
  builtins(),

  // Use Babel to transpile the result, limiting it to the source code.
  babel({
    presets: [
      [
        '@babel/preset-env',
        {
          modules: false,
          targets: {
            node: 'current',
          },
        },
      ],
      '@babel/preset-react',
      '@babel/preset-typescript',
    ],
    plugins: [
      '@babel/plugin-proposal-optional-chaining',
      '@babel/plugin-proposal-nullish-coalescing-operator',
      'babel-plugin-dynamic-import-node',
      'babel-plugin-styled-components',
      ['inline-json-import', {}],
    ],
    env: {
      test: {
        presets: [
          ['@babel/preset-react', { modules: 'commonjs' }],
          ['@babel/preset-env', { modules: 'commonjs' }],
        ],
      },
    },
    extensions: ['.js', '.jsx', '.es6', '.es', '.mjs', '.ts', '.tsx'],
    exclude: 'node_modules/**',
    runtimeHelpers: true,
  }),

  // Register Node.js globals for browserify compatibility.
  globals(),

  // Only minify the output in production, since it is very slow. And only
  // for UMD builds, since modules will be bundled by the consumer.
  isUmd && terser(),
];

export default [
  {
    input: INPUT_FILE,
    external: [
      ...Object.keys(PKG_JSON.dependencies || {}),
      ...Object.keys(PKG_JSON.peerDependencies || {}),
    ],
    output: [
      // CommonJS (for Node)
      {
        file: PKG_JSON.main,
        format: 'cjs',
        exports: 'named',
        sourcemap: true,
        name: PKG_JSON.name,
      },
      // ES module (for bundlers)
      {
        file: PKG_JSON.module,
        format: 'es',
        exports: 'named',
        sourcemap: true,
        name: PKG_JSON.name,
      },
    ],
    plugins,
  },
];
