/**
 * Custom config base for projects using jest.
 * @see https://github.com/belgattitude/nextjs-monorepo-example/tree/main/packages/eslint-config-bases
 */

const jestPatterns = {
  files: ['**/?(*.)+(test).{js,jsx,ts,tsx}'],
};

module.exports = {
  env: {
    es6: true,
    node: true,
  },
  overrides: [
    {
      // @see https://github.com/jest-community/eslint-plugin-jest
      extends: [
        'plugin:jest/recommended',
        'plugin:jest-formatting/recommended',
        'plugin:testing-library/react',
        'plugin:jest-dom/recommended',
      ],
      // Perf: To ensure best performance enable eslint-plugin-jest for test files only.
      files: jestPatterns.files,
      plugins: ['jest', 'jest-formatting', 'testing-library', 'jest-dom'],
      rules: {
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-object-literal-type-assertion': 'off',
        'import/default': 'off',
        'import/namespace': 'off',
        'import/no-duplicates': 'off',
        'import/no-named-as-default-member': 'off',
        'jest/consistent-test-it': ['error', { fn: 'it' }],
        'jest/expect-expect': 'off',
        'jest/no-commented-out-tests': 'off',
        'jest/no-duplicate-hooks': 'error',
        // Relax rules that are known to be slow and less useful in a test context
        'jest/no-export': 'off',
        'jest/no-identical-title': 'off',
        'jest/no-standalone-expect': 'off',
        // Relax rules that makes writing tests easier
        'jest/no-test-return-statement': 'error',
        'jest/prefer-hooks-in-order': 'error',
        'jest/prefer-hooks-on-top': 'error',
        'jest/prefer-strict-equal': 'error',
        'jest/prefer-to-have-length': 'error',
        'jest/valid-title': 'off',
      },
    },
  ],
};
