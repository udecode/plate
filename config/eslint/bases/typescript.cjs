const path = require('node:path');

const { filePatterns } = require('../constants/file-patterns.cjs');

/**
 * Custom config base for projects using typescript / javascript.
 *
 * @see https://github.com/belgattitude/nextjs-monorepo-example/tree/main/packages/eslint-config-bases
 */

/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ['eslint:recommended', 'plugin:import/recommended'],
  overrides: [
    {
      extends: [
        // 'eslint:recommended',
        // 'plugin:import/recommended',
        'plugin:import/typescript',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-type-checked',
        'plugin:@typescript-eslint/stylistic-type-checked',
      ],
      files: filePatterns.ts,
      rules: {
        // Override recommended-type-checked

        '@typescript-eslint/ban-ts-comment': [
          'error',
          {
            minimumDescriptionLength: 10,
            'ts-check': false,
            'ts-expect-error': 'allow-with-description',
            'ts-ignore': true,
            'ts-nocheck': true,
          },
        ],
        '@typescript-eslint/ban-tslint-comment': ['error'],
        '@typescript-eslint/consistent-generic-constructors': 'error',
        '@typescript-eslint/consistent-indexed-object-style': 'error',
        '@typescript-eslint/consistent-type-definitions': 'off',
        // not compatible with barrelby
        '@typescript-eslint/consistent-type-exports': 'off',
        // for now we can use both type and interface
        '@typescript-eslint/consistent-type-imports': [
          'warn',
          { fixStyle: 'inline-type-imports' },
        ],
        '@typescript-eslint/method-signature-style': ['error', 'property'],
        // false positive
        '@typescript-eslint/no-duplicate-type-constituents': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-empty-object-type': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-import-type-side-effects': 'error',
        '@typescript-eslint/no-misused-promises': [
          2,
          { checksVoidReturn: false },
        ],
        // Override stylistic-type-checked

        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-redundant-type-constituents': 'off',
        '@typescript-eslint/no-unnecessary-type-assertion': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        // Override strict-type-checked

        '@typescript-eslint/no-unused-expressions': 'off',
        '@typescript-eslint/no-unused-vars': [
          'warn',
          {
            argsIgnorePattern: '^_',
            caughtErrors: 'none',
            ignoreRestSiblings: true,
          },
        ],
        '@typescript-eslint/non-nullable-type-assertion-style': 'off',
        '@typescript-eslint/prefer-nullish-coalescing': 'off',
        '@typescript-eslint/require-await': 'warn',

        '@typescript-eslint/restrict-template-expressions': 'off',
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
        '@typescript-eslint/consistent-type-exports': 'off',
        '@typescript-eslint/consistent-type-imports': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/naming-convention': 'off',
      },
    },
    {
      // commonjs or assumed
      files: filePatterns.js,
      parser: 'espree',
      parserOptions: {
        ecmaVersion: 2020,
      },
      rules: {
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/consistent-type-exports': 'off',
        '@typescript-eslint/consistent-type-imports': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/naming-convention': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-require-imports': 'off',
      },
    },
    {
      files: filePatterns.test,
      rules: {
        '@typescript-eslint/require-await': 'off',
      },
    },
  ],
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
    // 'linebreak-style': ['error', 'unix'],
    'no-case-declarations': 'off',
    // will use 'import/no-duplicates'.
    'no-duplicate-imports': 'off',
    'no-empty': ['error', { allowEmptyCatch: true }],
    'no-empty-function': 'off',
    'no-prototype-builtins': 'off',
    /** Remove unused imports */
    'no-unused-vars': 'off', // or "@typescript-eslint/no-unused-vars": "off",
    // 'spaced-comment': [
    //   'error',
    //   'always',
    //   {
    //     block: {
    //       balanced: true,
    //       exceptions: ['*'],
    //       markers: ['!'],
    //     },
    //     line: {
    //       exceptions: ['-', '+'],
    //       markers: ['/'],
    //     },
    //   },
    // ],
    // No unused imports
    'unused-imports/no-unused-imports': 'error',
    // No unused variables
    'unused-imports/no-unused-vars': 'off',
  },
  settings: {
    'import/resolver': {
      typescript: {},
    },
  },
};
