/**
 * Custom config base for projects using prettier.
 *
 * @see https://github.com/belgattitude/nextjs-monorepo-example/tree/main/packages/eslint-config-bases
 */
const { getPrettierConfig } = require('../helpers/getPrettierConfig.cjs');

const { ...prettierConfig } = getPrettierConfig();

/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ['prettier'],
  overrides: [
    {
      files: ['index.ts*'],
      rules: {
        'padding-line-between-statements': 'off',
        'pretter/prettier': 'off',
      },
    },
  ],
  plugins: ['prettier'],
  rules: {
    'arrow-body-style': 'off',
    'padding-line-between-statements': [
      'warn',
      { blankLine: 'never', next: 'case', prev: '*' },
      { blankLine: 'always', next: 'break', prev: '*' },
      { blankLine: 'always', next: 'class', prev: '*' },
      { blankLine: 'always', next: '*', prev: 'class' },
      { blankLine: 'always', next: 'continue', prev: '*' },
      { blankLine: 'always', next: 'do', prev: '*' },
      { blankLine: 'always', next: '*', prev: 'do' },
      { blankLine: 'always', next: 'export', prev: '*' },
      { blankLine: 'always', next: '*', prev: 'export' },
      { blankLine: 'always', next: 'for', prev: '*' },
      { blankLine: 'always', next: '*', prev: 'for' },
      { blankLine: 'always', next: 'function', prev: '*' },
      { blankLine: 'always', next: '*', prev: 'function' },
      { blankLine: 'always', next: 'if', prev: '*' },
      { blankLine: 'always', next: '*', prev: 'if' },
      { blankLine: 'never', next: 'if', prev: 'if' },
      { blankLine: 'always', next: 'return', prev: '*' },
      { blankLine: 'always', next: 'switch', prev: '*' },
      { blankLine: 'always', next: '*', prev: 'switch' },
      { blankLine: 'always', next: 'throw', prev: '*' },
      { blankLine: 'always', next: 'try', prev: '*' },
      { blankLine: 'always', next: '*', prev: 'try' },
      { blankLine: 'always', next: 'while', prev: '*' },
      { blankLine: 'always', next: '*', prev: 'while' },
    ],
    'prefer-arrow-callback': 'off',

    'prettier/prettier': ['warn', prettierConfig],
  },
};
