/**
 * Custom config base for projects that wants to enable regexp rules.
 * @see https://github.com/belgattitude/nextjs-monorepo-example/tree/main/packages/eslint-config-bases
 */
const { filePatterns } = require('../constants/file-patterns.cjs');

module.exports = {
  // @see https://github.com/ota-meshi/eslint-plugin-regexp
  extends: ['plugin:regexp/recommended'],
  overrides: [
    {
      extends: ['plugin:regexp/recommended'],
      files: filePatterns.jsx,
      rules: {
        'prefer-regex-literals': 'off',
        'regexp/prefer-result-array-groups': 'off',
        'regexp/strict': 'off',
      },
    },
  ],
};
