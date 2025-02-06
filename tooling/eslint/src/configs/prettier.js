// import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

import { defineConfig } from '../utils.js';
// import prettierConfig from './prettier.base.config.js';

export default defineConfig(
  // eslintPluginPrettierRecommended,
  {
    rules: {
      'arrow-body-style': 'off',
      'lines-around-directive': ['warn', 'always'],
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

      'prettier/prettier': 'off',
      // 'prettier/prettier': [
      //   'warn',
      //   prettierConfig,
      //   {
      //     usePrettierrc: false,
      //   },
      // ],
    },
  },
  {
    files: ['index.ts', '**/*.mdx'],
    rules: {
      'prettier/prettier': 'off',
    },
  }
);
