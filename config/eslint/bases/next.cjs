module.exports = {
  extends: ['plugin:@next/next/core-web-vitals'],
  overrides: [
    {
      excludedFiles: [
        '**/*.test.*',
        '**/*.spec.*',
        '**/*.fixtures.*',
        '**/__tests__/**/*',
        '**/apps/**/*',
      ],
      files: ['**/packages/**'],
      rules: {
        'import/no-extraneous-dependencies': [
          'error',
          {
            devDependencies: false,
            includeInternal: false,
            includeTypes: false,
          },
        ],
      },
    },
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
        js: 'ignorePackages',
        json: 'always',
        jsx: 'never',
        scss: 'always',
        ts: 'never',
        tsx: 'never',
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
        ignore: ['^@/'],
      },
    ],
    'import/prefer-default-export': 'off',
  },
};
