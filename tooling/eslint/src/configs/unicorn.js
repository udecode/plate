import eslintPluginUnicorn from 'eslint-plugin-unicorn';

import { defineConfig } from '../utils.js';

export default defineConfig(
  eslintPluginUnicorn.configs['flat/recommended'],
  {
    files: ['packages/cli/**'],
    rules: {
      'unicorn/no-process-exit': 'off',
      'unicorn/prefer-node-protocol': 'off',
      'unicorn/prefer-string-replace-all': 'off',
      'unicorn/prefer-top-level-await': 'off',
    },
  },
  {
    rules: {
      'unicorn/consistent-destructuring': 'off',
      'unicorn/consistent-function-scoping': [
        'error',
        {
          checkArrowFunctions: false,
        },
      ],
      'unicorn/expiring-todo-comments': 'off',
      'unicorn/filename-case': 'off',
      'unicorn/import-style': 'off',
      'unicorn/new-for-builtins': 'off',
      'unicorn/no-abusive-eslint-disable': 'off',
      'unicorn/no-array-callback-reference': 'off',
      'unicorn/no-array-for-each': 'off',
      'unicorn/no-array-reduce': 'off',
      'unicorn/no-await-expression-member': 'off',
      'unicorn/no-document-cookie': 'off',
      // TypeScript doesn't like the for-of loop this rule fixes to
      'unicorn/no-for-loop': 'off',
      'unicorn/no-nested-ternary': 'off',
      'unicorn/no-new-array': 'off',
      'unicorn/no-null': 'off',
      'unicorn/no-process-exit': 'off',
      'unicorn/no-thenable': 'off',
      'unicorn/no-useless-undefined': 'off',
      'unicorn/prefer-export-from': 'off',
      'unicorn/prefer-global-this': 'off',
      'unicorn/prefer-module': 'off',
      'unicorn/prefer-optional-catch-binding': 'off',
      'unicorn/prefer-regexp-test': 'off',
      // Spread syntax causes non-deterministic type errors
      'unicorn/prefer-spread': 'off',
      'unicorn/prefer-string-replace-all': 'off',
      'unicorn/prefer-ternary': 'off',
      'unicorn/prevent-abbreviations': 'off',
    },
  }
);
