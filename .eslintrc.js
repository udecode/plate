module.exports = {
  extends: ['@borealisgroup/eslint-config-ts', 'plugin:mdx/recommended'],
  rules: {
    'no-alert': 'off',
    'import/extensions': [
      'error',
      'never',
      {
        ts: 'never',
        tsx: 'never',
        js: 'never',
        jsx: 'never',
      },
    ],
    'react/jsx-filename-extension': [
      'error',
      { extensions: ['.js', '.jsx', '.ts', '.tsx', 'mdx'] },
    ],
  },
  overrides: [
    {
      files: '**/*.stories.tsx',
      rules: {
        // just for showing the code in addon-docs
        'react-hooks/rules-of-hooks': 'off'
      },
    },
    {
      files: '**/*.mdx',
      rules: {
        'prettier/prettier': 'off',
        'simple-import-sort/sort': 'off',
        'import/order': ['error', { 'newlines-between': 'never' }],
      },
    },
  ]
};
