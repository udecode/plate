module.exports = {
  extends: ['plugin:unicorn/recommended'],
  plugins: ['unicorn'],
  rules: {
    'unicorn/expiring-todo-comments': 'off',
    'unicorn/filename-case': 'off',
    'unicorn/no-array-for-each': 'off',
    'unicorn/no-null': 'off',
    'unicorn/consistent-function-scoping': [
      'error',
      {
        checkArrowFunctions: false,
      },
    ],
    'unicorn/prevent-abbreviations': 'off',
    // Spread syntax causes non-deterministic type errors
    'unicorn/prefer-spread': 'off',

    // TypeScript doesn't like the for-of loop this rule fixes to
    'unicorn/no-for-loop': 'off',
  },
};
