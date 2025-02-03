/**
 * Opinionated config base for projects using react-testing-library
 * @see https://github.com/belgattitude/nextjs-monorepo-example/tree/main/packages/eslint-config-bases
 */
const { filePatterns } = require('../constants/file-patterns.cjs');

module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  overrides: [
    {
      // For performance enable react-testing-library only on test files
      files: filePatterns.test,
      extends: ['plugin:testing-library/react'],
      rules: {
        'testing-library/no-node-access': 'off',
        'testing-library/prefer-screen-queries': 'off',
        'testing-library/prefer-presence-queries': 'off',
      }
    },
    {
      files: ['**/test-utils.tsx'],
      rules: {
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        'import/export': 'off',
      },
    },
  ],
};
