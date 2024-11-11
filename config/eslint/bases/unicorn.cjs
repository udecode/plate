module.exports = {
  extends: ['plugin:unicorn/recommended'],
  overrides: [
    {
      files: ['packages/cli/**'],
      rules: {
        'unicorn/no-process-exit': 'off',
        'unicorn/prefer-node-protocol': 'off',
        'unicorn/prefer-string-replace-all': 'off',
        'unicorn/prefer-top-level-await': 'off',
      },
    },
  ],
  plugins: ['unicorn'],
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
    'unicorn/new-for-builtins': 'off',
    'unicorn/no-abusive-eslint-disable': 'off',
    'unicorn/no-array-callback-reference': 'off',
    'unicorn/no-array-for-each': 'off',
    'unicorn/no-array-reduce': 'off',
    'unicorn/no-for-loop': 'off',
    'unicorn/no-null': 'off',
    'unicorn/no-thenable': 'off',
    'unicorn/prefer-export-from': 'off',
    'unicorn/prefer-module': 'off',
    'unicorn/prefer-optional-catch-binding': 'off',
    'unicorn/prefer-regexp-test': 'off',
    // Spread syntax causes non-deterministic type errors
    'unicorn/prefer-spread': 'off',
    'unicorn/prefer-string-replace-all': 'off',

    // TypeScript doesn't like the for-of loop this rule fixes to
    'unicorn/prevent-abbreviations': 'off',
  },
};
