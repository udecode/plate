const { filePatterns } = require('./config/eslint/constants/file-patterns.cjs');
const {
  getDefaultIgnorePatterns,
} = require('./config/eslint/helpers/getDefaultIgnorePatterns.cjs');

/** @type {import('eslint').Linter.Config} */
module.exports = {
  env: {
    browser: true,
    es6: true,
    jest: true,
    node: true,
    webextensions: false,
  },
  extends: [
    'turbo',

    './config/eslint/bases/typescript.cjs',
    './config/eslint/bases/regexp.cjs',
    './config/eslint/bases/jest.cjs',
    './config/eslint/bases/react.cjs',
    './config/eslint/bases/tailwind.cjs',
    './config/eslint/bases/rtl.cjs',
    './config/eslint/bases/next.cjs',

    './config/eslint/bases/unicorn.cjs',
    './config/eslint/bases/perfectionist.cjs',

    './config/eslint/bases/prettier.cjs',
  ],
  ignorePatterns: [
    ...getDefaultIgnorePatterns(),
    '.next',
    '.out',
    '**/*.mdx',
    '**/__registry__',
    '**/scripts/*.mts',
  ],
  overrides: [
    {
      files: ['*.ts', '*.tsx', '*.mts'],
      parserOptions: {
        project: true,
      },
    },
    {
      extends: ['plugin:@dword-design/import-alias/recommended'],
      files: ['apps/www/src/**/*'],
      rules: {
        '@dword-design/import-alias/prefer-alias': [
          'warn',
          {
            alias: {
              '@/__registry__': './apps/www/src/__registry__',
              '@/app': './apps/www/src/app',
              '@/components': './apps/www/src/components',
              '@/hooks': './apps/www/src/hooks',
              '@/lib': './apps/www/src/lib',
              '@/plate': './apps/www/src/lib/plate',
              '@/registry': './apps/www/src/registry',
              '@/styles': './apps/www/src/styles',
            },
          },
        ],
        'import/no-relative-packages': 'off',
      },
    },
    {
      files: filePatterns.test,
      rules: {
        'import/no-relative-packages': 'off',
        'import/no-unresolved': 'off',
        'react/jsx-key': 'off',
      },
    },
    {
      env: {
        jest: true,
      },
      files: filePatterns.test,
      rules: {
        '@typescript-eslint/no-unused-vars': 'off',
        'no-restricted-imports': [
          'error',
          {
            paths: [],
          },
        ],
        'react-hooks/rules-of-hooks': 'off',
      },
    },
    {
      files: ['index.ts', '**/*.mdx'],
      rules: {
        'prettier/prettier': 'off',
      },
    },
  ],
  parser: '@typescript-eslint/parser',
  root: true,
  rules: {},
  settings: {
    // 'import/parsers': {
    //   '@typescript-eslint/parser': ['.ts', '.tsx'],
    // },
    // 'import/resolver': {
    //   node: {
    //     moduleDirectory: ['node_modules'],
    //     typescript: {
    //       alwaysTryTypes: true,
    //     },
    //   },
    //   typescript: {},
    // },
    next: {
      rootDir: ['apps/www'],
    },
    react: { version: 'detect' },
  },
};
