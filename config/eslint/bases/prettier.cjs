/**
 * Custom config base for projects using prettier.
 * @see https://github.com/belgattitude/nextjs-monorepo-example/tree/main/packages/eslint-config-bases
 */
const { getPrettierConfig } = require('../helpers/getPrettierConfig.cjs');

const { ...prettierConfig } = getPrettierConfig();

/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ['prettier'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': ['warn', prettierConfig],
    'arrow-body-style': 'off',
    'prefer-arrow-callback': 'off',
  },
};
