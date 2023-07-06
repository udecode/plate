module.exports = {
  extends: ['next/core-web-vitals'],
  plugins: ['unused-imports'],
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
        ignore: ['^@/plate'],
      },
    ],
    'import/prefer-default-export': 'off',
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
