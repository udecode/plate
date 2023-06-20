module.exports = {
  extends: ['next/core-web-vitals'],
  plugins: ['simple-import-sort', 'unused-imports'],
  rules: {
    // https://github.com/vercel/next.js/discussions/16832
    '@next/next/no-html-link-for-pages': 'off',
    '@next/next/no-img-element': 'off',

    // https://github.com/benmosher/eslint-plugin-import/issues/1558
    'import/extensions': [
      'error',
      'never',
      {
        ts: 'never',
        tsx: 'never',
        js: 'never',
        jsx: 'never',
        json: 'always',
        scss: 'always',
      },
    ],
    'import/no-cycle': 'off',
    'import/no-dynamic-require': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/no-named-as-default': 'off',
    'import/no-named-as-default-member': 'off',
    'import/no-unresolved': [
      'error',
      {
        ignore: ['^@theme', '^@docusaurus', '^@generated', '^@/plate'],
      },
    ],
    'import/order': ['off', { 'newlines-between': 'always' }], // Allow single Named-export
    'import/prefer-default-export': 'off',
    'simple-import-sort/imports': [
      'error',
      {
        groups: [
          [
            // import "./setup": Side effect imports.
            '^\\u0000',
            // Node.js builtins.`
            '^(assert|buffer|child_process|cluster|console|constants|crypto|dgram|dns|domain|events|fs|http|https|module|net|os|path|punycode|querystring|readline|repl|stream|string_decoder|sys|timers|tls|tty|url|util|vm|zlib|freelist|v8|process|async_hooks|http2|perf_hooks)(/.*|$)',
            // import react from "react": Packages.
            '^react',
            // Things that start with a letter (or digit or underscore), or `@` followed by a letter.
            '^@?\\w',
            // import a from "/a": Absolute imports and other imports.
            // Anything that does not start with a dot.
            '^(assets|components|config|hooks|plugins|store|styled|themes|utils|contexts)(/.*|$)',
            // import a from "./a": Relative imports.
            // Parent imports. Put `..` last.
            '^\\.\\.(?!/?$)',
            '^\\.\\./?$',
            // Other relative imports. Put same-folder imports and `.` last.
            '^\\./(?=.*/)(?!/?$)',
            '^\\.(?!/?$)',
            '^\\./?$',
          ],
        ],
      },
    ],
  },
  overrides: [
    {
      files: ['apps/www/next.config.mjs'],
      rules: {
        '@typescript-eslint/ban-ts-comment': 'off',
      },
    },
    // {
    //   files: ['apps/www/src/pages/\\_*.{ts,tsx}'],
    //   rules: {
    //     'react/display-name': 'off',
    //   },
    // },
  ],
};
