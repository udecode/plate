module.exports = {
  extends: ['plugin:unicorn/recommended'],
  plugins: ['unicorn'],
  rules: {
    'unicorn/no-abusive-eslint-disable': 'off',
    'unicorn/prefer-module': 'off',
    'unicorn/consistent-destructuring': 'off',
    'unicorn/consistent-function-scoping': [
      'error',
      {
        checkArrowFunctions: false,
      },
    ],
    'unicorn/expiring-todo-comments': 'off',
    'unicorn/filename-case': 'off',
    'unicorn/no-array-callback-reference': 'off',
    'unicorn/no-array-for-each': 'off',
    'unicorn/no-array-reduce': 'off',
    'unicorn/no-for-loop': 'off',
    'unicorn/no-null': 'off',
    'unicorn/no-thenable': 'off',
    'unicorn/prefer-optional-catch-binding': 'off',
    'unicorn/prefer-regexp-test': 'off',
    // Spread syntax causes non-deterministic type errors
    'unicorn/prefer-spread': 'off',

    // TypeScript doesn't like the for-of loop this rule fixes to
    'unicorn/prevent-abbreviations': 'off',
  },
  overrides: [
    {
      files: ['packages/cli/**'],
      rules: {
        'unicorn/prefer-node-protocol': 'off',
        'unicorn/no-process-exit': 'off',
        'unicorn/prefer-top-level-await': 'off',
        'unicorn/prefer-string-replace-all': 'off',
      },
    },
  ],
};
