module.exports = {
  extends: [
    '../../../.eslintrc',
    'plugin:@next/next/core-web-vitals',
    'plugin:@dword-design/import-alias/recommended',
    '../../../config/eslint/bases/prettier.cjs',
  ],
  rules: {
    '@dword-design/import-alias/prefer-alias': [
      'warn',
      {
        alias: {
          '@/plate': './src/lib/plate',
          '@/components': './src/components',
          '@/styles': './src/styles',
          '@/lib': './src/lib',
        },
      },
    ],
  },
};
