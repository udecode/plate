import { fixupConfigRules } from '@eslint/compat';

import { compat, defineConfig } from '../utils.js';

export default defineConfig(
  ...fixupConfigRules(compat.extends('plugin:react/recommended')),
  ...fixupConfigRules(compat.extends('plugin:react-hooks/recommended')),
  ...fixupConfigRules(compat.extends('plugin:jsx-a11y/strict')),

  {
    rules: {
      'jsx-a11y/anchor-has-content': 'off',
      // https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/HEAD/docs/rules/anchor-is-valid.md
      'jsx-a11y/anchor-is-valid': 'off',

      'jsx-a11y/click-events-have-key-events': 'off',
      'jsx-a11y/heading-has-content': 'off',

      'jsx-a11y/html-has-lang': 'off',
      'jsx-a11y/interactive-supports-focus': 'off',
      'jsx-a11y/media-has-caption': 'off',
      'jsx-a11y/no-autofocus': 'off',
      'jsx-a11y/no-static-element-interactions': 'off',
      'react-hooks/exhaustive-deps': [
        'warn',
        {
          additionalHooks: '(useMyCustomHook|useMyOtherCustomHook)',
          enableDangerousAutofixThisMayCauseInfiniteLoops: true,
        },
      ],
      'react-hooks/rules-of-hooks': 'error',

      'react/display-name': 'off',
      'react/jsx-curly-brace-presence': [
        'warn',
        { children: 'never', props: 'never' },
      ],
      'react/jsx-newline': ['off'],
      // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/no-unescaped-entities.md
      'react/no-unescaped-entities': ['error', { forbid: ['>'] }],

      // Rely on tsc to catch unknown properties
      'react/no-unknown-property': 'off',

      // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-unknown-property.md
      'react/prop-types': 'off',
      // Fine-tune naming convention react typescript jsx (function components)
      'react/react-in-jsx-scope': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    files: [String.raw`pages/\_*.{ts,tsx}`],
    rules: {
      'react/display-name': 'off',
    },
  },
  {
    files: ['**/registry/default/**/*'],
    rules: {
      'jsx-a11y/alt-text': 'off',
      'jsx-a11y/iframe-has-title': 'off',
      'jsx-a11y/media-has-caption': 'off',
      'react/jsx-no-comment-textnodes': 'off',
    },
  },
  {
    files: [
      'src/**/queries/*',
      'src/app/**/page.tsx',
      'src/app/**/layout.tsx',
      'src/**/*-server.tsx',
    ],
    rules: {
      'react-hooks/rules-of-hooks': 'off',
    },
  }
);
