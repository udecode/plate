const path = require('node:path');

/**
 * Custom config base for projects using typescript / javascript.
 * @see https://github.com/belgattitude/nextjs-monorepo-example/tree/main/packages/eslint-config-bases
 */

/** @type {import("eslint").Linter.Config} */
module.exports = {
  // Parser to use
  parser: '@typescript-eslint/parser',
  // Parser options
  parserOptions: {
    parser: '@typescript-eslint/parser',
    // project: path.join(__dirname, '../../../tsconfig.json'),
  },
  plugins: ['unused-imports'],
  rules: {
    'import/default': ['error'],
    // Slow: https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/namespace.md
    'import/namespace': 'off', // ['error'] If you want the extra check (typechecks will spot most issues already)
    // https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/no-duplicates.md
    'import/no-duplicates': [
      'error',
      {
        // can't autofix yet
        // 'prefer-inline': true
      },
    ],
    'import/no-named-as-default': ['warn'],
    'import/no-named-as-default-member': 'off',
    'linebreak-style': ['error', 'unix'],
    'no-case-declarations': 'off',
    // will use 'import/no-duplicates'.
    'no-duplicate-imports': 'off',
    'no-empty-function': 'off',
    'no-prototype-builtins': 'off',
    /** Remove unused imports */
    'no-unused-vars': 'off', // or "@typescript-eslint/no-unused-vars": "off",
    'spaced-comment': [
      'error',
      'always',
      {
        block: {
          balanced: true,
          exceptions: ['*'],
          markers: ['!'],
        },
        line: {
          exceptions: ['-', '+'],
          markers: ['/'],
        },
      },
    ],
    // No unused imports
    'unused-imports/no-unused-imports': 'error',
    // No unused variables
    'unused-imports/no-unused-vars': 'off',
  },
  // Overrides for specific files
  overrides: [
    {
      files: ['*.ts', '*.tsx', '*.mts'],
      extends: [
        // 'eslint:recommended',
        // 'plugin:import/recommended',
        'plugin:import/typescript',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-type-checked',
        'plugin:@typescript-eslint/stylistic-type-checked',
      ],
      rules: {
        // TS rules
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/ban-ts-ignore': 'off',
        '@typescript-eslint/ban-types': 'off',
        '@typescript-eslint/camelcase': 'off',
        '@typescript-eslint/consistent-type-exports': 'off',
        '@typescript-eslint/consistent-type-imports': 'off',
        // not yet working with prettier + eslint (duplicate)
        // '@typescript-eslint/consistent-type-imports': [
        //   'warn',
        //   {
        //     prefer: 'type-imports',
        //     fixStyle: 'inline-type-imports',
        //   },
        // ],
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/interface-name-prefix': 'off',
        '@typescript-eslint/naming-convention': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-empty-interface': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-namespace': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-shadow': ['error'],
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/no-use-before-define': 'off',
        '@typescript-eslint/no-useless-constructor': 'off',
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
    {
      files: ['packages/cli/**'],
      rules: {
        '@typescript-eslint/no-shadow': 'off',
      },
    },
    {
      files: ['*.mjs'],
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      rules: {
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/consistent-type-exports': 'off',
        '@typescript-eslint/consistent-type-imports': 'off',
      },
    },
    {
      // commonjs or assumed
      files: ['*.js', '*.cjs'],
      parser: 'espree',
      parserOptions: {
        ecmaVersion: 2020,
      },
      rules: {
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/consistent-type-exports': 'off',
        '@typescript-eslint/consistent-type-imports': 'off',
      },
    },
  ],
  settings: {
    'import/resolver': {
      typescript: {},
    },
  },
};
