module.exports = {
  extends: ['next/core-web-vitals'],
  rules: {
    // https://github.com/vercel/next.js/discussions/16832
    '@next/next/no-img-element': 'off',
    '@next/next/no-html-link-for-pages': 'off',
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
