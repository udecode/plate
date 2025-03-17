/* eslint-disable unicorn/no-useless-spread */
import { fixupConfigRules } from '@eslint/compat';
import js from '@eslint/js';
import unusedImports from 'eslint-plugin-unused-imports';
import tseslint from 'typescript-eslint';

import { compat, defineConfig, legacyPlugin } from '../utils.js';

export default defineConfig(
  // Base JS/TS configs
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  {
    rules: {
      // '@typescript-eslint/no-var-requires': 'off',
      // Override recommended-type-checked
      ...{
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
        '@typescript-eslint/ban-types': 'off',
        '@typescript-eslint/no-empty-object-type': [
          'error',
          {
            allowInterfaces: 'always',
            allowObjectTypes: 'always',
          },
        ],
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-misused-promises': [
          2,
          { checksVoidReturn: false },
        ],
        '@typescript-eslint/no-redundant-type-constituents': 'off',
        '@typescript-eslint/no-require-imports': 'off',
        '@typescript-eslint/no-unnecessary-type-assertion': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-function-type': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/no-unused-expressions': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/only-throw-error': 'off',
        '@typescript-eslint/require-await': 'off',
        '@typescript-eslint/restrict-template-expressions': 'off',
      },
      // Override stylistic-type-checked
      ...{
        '@typescript-eslint/ban-tslint-comment': ['error'],
        '@typescript-eslint/consistent-generic-constructors': 'error',
        '@typescript-eslint/consistent-indexed-object-style': 'error',
        '@typescript-eslint/consistent-type-definitions': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-empty-interface': 'off',
        '@typescript-eslint/non-nullable-type-assertion-style': 'off',
        '@typescript-eslint/prefer-nullish-coalescing': 'off',
      },
      // Override strict-type-checked
      ...{
        '@typescript-eslint/no-non-null-assertion': 'off',
      },
      // for now we can use both type and interface
      '@typescript-eslint/consistent-type-exports': 'warn',
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/method-signature-style': ['error', 'property'],
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/unbound-method': 'off',
    },
  },

  {
    files: ['*.mjs'],
    rules: {
      '@typescript-eslint/consistent-type-exports': 'off',
      '@typescript-eslint/consistent-type-imports': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/naming-convention': 'off',
    },
  },
  ...fixupConfigRules(compat.extends('plugin:import/recommended')),
  ...fixupConfigRules(compat.extends('plugin:import/typescript')),
  {
    plugins: {
      // https://github.com/import-js/eslint-plugin-import/issues/2948#issuecomment-2148832701
      import: legacyPlugin('eslint-plugin-import', 'import'),
    },
    rules: {
      // Wait for fix: parserPath or languageOptions.parser is required! https://github.com/import-js/eslint-plugin-import/issues/2556
      ...{
        'import/default': 'off',
        'import/export': 'off',
        'import/no-named-as-default': 'off',
      },
      'import/namespace': 'off',
      'import/no-duplicates': [
        'error',
        {
          // https://github.com/import-js/eslint-plugin-import/issues/2792
          // 'prefer-inline': true
        },
      ],
      'import/no-named-as-default-member': 'off',
      'import/no-unresolved': 'off',
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
        },
      },
    },
  },
  {
    plugins: {
      'unused-imports': unusedImports,
    },
    // List of rules to use
    rules: {
      'linebreak-style': ['error', 'unix'],
      'no-case-declarations': 'off',
      'no-duplicate-imports': 'off',
      'no-empty-function': 'off',
      'no-prototype-builtins': 'off',
      'no-unused-vars': 'off',
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
      'unused-imports/no-unused-vars': 'off',
    },
  }
);
