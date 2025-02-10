import { fixupConfigRules } from '@eslint/compat';

import { compat, defineConfig } from '../utils.js';

const jestPatterns = {
  files: ['**/?(*.)+(test|spec).{js,jsx,ts,tsx}'],
};

export default defineConfig(
  ...fixupConfigRules(compat.extends('plugin:jest/recommended')),
  ...fixupConfigRules(compat.extends('plugin:jest-formatting/recommended')),
  ...fixupConfigRules(compat.extends('plugin:jest-dom/recommended')),
  {
    files: jestPatterns.files,
    rules: {
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      'import/default': 'off',
      'import/namespace': 'off',
      'import/no-duplicates': 'off',
      'import/no-named-as-default-member': 'off',
      'jest/consistent-test-it': ['error', { fn: 'it' }],
      'jest/expect-expect': 'off',
      'jest/no-commented-out-tests': 'off',
      'jest/no-disabled-tests': 'off',
      'jest/no-duplicate-hooks': 'error',
      'jest/no-export': 'off',
      'jest/no-identical-title': 'off',
      'jest/no-standalone-expect': 'off',
      'jest/no-test-return-statement': 'error',
      'jest/prefer-hooks-in-order': 'error',
      'jest/prefer-hooks-on-top': 'error',
      'jest/prefer-strict-equal': 'off',
      'jest/prefer-to-have-length': 'error',
      'jest/valid-title': 'off',
    },
  }
);
