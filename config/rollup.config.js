import fs from 'fs';
import path from 'path';
import autoprefixer from 'autoprefixer';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import del from 'rollup-plugin-delete';
import includePaths from 'rollup-plugin-includepaths';
import json from 'rollup-plugin-json';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';
import resolve from 'rollup-plugin-node-resolve';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';
import { terser } from 'rollup-plugin-terser';
import tailwind from 'tailwindcss';

const PACKAGE_ROOT_PATH = process.cwd();
const INPUT_FILE_PATH = path.join(PACKAGE_ROOT_PATH, 'src/index.ts');
const INPUT_FILE = fs.existsSync(INPUT_FILE_PATH)
  ? INPUT_FILE_PATH
  : path.join(PACKAGE_ROOT_PATH, 'src/index.tsx');
const PKG_JSON = require(path.join(PACKAGE_ROOT_PATH, 'package.json'));
const babelConfig = require('./babel.config');

const isUmd = false;

const includePathOptions = {
  include: {},
  paths: [path.join(PACKAGE_ROOT_PATH, 'src')],
  external: [],
  extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
};

const onwarn = (warning) => {
  // Silence circular dependency warning for moment package
  if (['CIRCULAR_DEPENDENCY', 'THIS_IS_UNDEFINED'].includes(warning.code)) {
    return;
  }

  console.warn(`(!) ${warning.message}`);
};

const plugins = [
  // Automatically externalize peerDependencies
  peerDepsExternal(),

  // Let you use relative paths in your import directives
  includePaths(includePathOptions),

  // Allow Rollup to resolve modules from `node_modules`, since it only
  // resolves local modules by default.
  resolve({
    browser: true,
    preferBuiltins: true,
    // modulesOnly: true,
  }),

  // Allow Rollup to resolve CommonJS modules, since it only resolves ES2015
  // modules by default.
  commonjs({
    include: /node_modules/,
    namedExports: {
      'react-is': ['typeOf', 'isElement', 'isForwardRef', 'isValidElementType'],
    },
  }),

  // Convert JSON imports to ES6 modules.
  json(),

  // Register Node.js builtins for browserify compatibility.
  builtins(),

  del({ targets: './dist/*' }),

  // svgr(),
  // typescript({
  //   verbosity: 1,
  //   tsconfig: './tsconfig.rollup.json',
  // }),
  // url({
  //   include: [
  //     './fonts/**/*.ttf',
  //     './fonts/**/*.woff',
  //     './fonts/**/*.woff2',
  //     './fonts/**/*.svg',
  //   ],
  // }),

  // Use Babel to transpile the result, limiting it to the source code.
  babel({
    presets: [
      ...babelConfig.presets,
      [
        '@babel/preset-env',
        {
          modules: false,
          targets: {
            node: 'current',
          },
        },
      ],
    ],
    plugins: [
      ...babelConfig.plugins,
      '@babel/plugin-proposal-optional-chaining',
      '@babel/plugin-proposal-nullish-coalescing-operator',
      'babel-plugin-dynamic-import-node',
      ['inline-json-import', {}],
      [
        'import',
        {
          libraryName: 'lodash',
          libraryDirectory: '',
          camel2DashComponentName: false,
        },
        'lodash',
      ],
      [
        'import',
        {
          libraryName: 'react-use',
          libraryDirectory: 'lib',
          camel2DashComponentName: false,
        },
        'react-use',
      ],
    ],
    env: {
      test: {
        presets: [
          ['@babel/preset-react', { modules: '../../../../commonjs' }],
          ['@babel/preset-env', { modules: '../../../../commonjs' }],
        ],
      },
    },
    extensions: ['.js', '.jsx', '.es6', '.es', '.mjs', '.ts', '.tsx'],
    exclude: /node_modules/,
    runtimeHelpers: true,
  }),

  postcss({
    config: {
      path: '../postcss.config.js',
    },
    plugins: [
      autoprefixer(),
      tailwind({
        config: '../tailwind.config.js',
      }),
    ],
  }),

  // Register Node.js globals for browserify compatibility.
  globals(),

  // Only minify the output in production, since it is very slow. And only
  // for UMD builds, since modules will be bundled by the consumer.
  isUmd &&
    terser({
      compress: true,
      mangle: true,
      output: {
        preamble: '/* eslint-disable */',
        comments: false,
      },
    }),
];

export default [
  {
    input: INPUT_FILE,
    external: [
      ...Object.keys(PKG_JSON.dependencies || {}),
      ...Object.keys(PKG_JSON.peerDependencies || {}),
      'react-textarea-autosize',
    ],
    // external(id) {
    //      return Object.keys(PKG_JSON.dependencies || {})
    //        .concat(Object.keys(PKG_JSON.peerDependnencies || {}))
    //        .includes(id.split('/')[0]);
    //    },
    output: [
      // CommonJS (for Node)
      {
        file: PKG_JSON.main,
        format: 'cjs',
        name: PKG_JSON.name,
        sourcemap: true,
      },
      // ES module (for bundlers)
      {
        file: PKG_JSON.module,
        format: 'es',
        name: PKG_JSON.name,
        sourcemap: true,
      },
    ],
    plugins,
    watch: {
      include: 'src/**',
      // exclude: 'node_modules/**',
    },
    onwarn,
  },
];
