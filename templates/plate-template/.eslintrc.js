const path = require('path');
const prettierConfig = require('./prettier.config.js');

module.exports = {
  $schema: 'https://json.schemastore.org/eslintrc',
  root: true,
  extends: [
    'next/core-web-vitals',
    'prettier',
    'plugin:tailwindcss/recommended',
  ],
  plugins: ['tailwindcss', 'unused-imports', 'prettier'],
  rules: {
    '@next/next/no-html-link-for-pages': 'off',
    'prettier/prettier': ['warn', { ...prettierConfig }],
    'react/jsx-key': 'off',
    'react/display-name': 'off',
    'tailwindcss/classnames-order': 'warn',
    'tailwindcss/no-custom-classname': 'error',
    'unused-imports/no-unused-imports': 'warn',
    'unused-imports/no-unused-vars': [
      'warn',
      {
        ignoreRestSiblings: true,
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'none',
        argsIgnorePattern: '^_',
      },
    ],
  },
  settings: {
    tailwindcss: {
      callees: ['cn', 'cva', 'withCn'],
      config: path.join(__dirname, './tailwind.config.js'),
    },
    next: {
      rootDir: ['./'],
    },
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
    },
  ],
};
