module.exports = {
  extends: ['@borealisgroup/eslint-config-ts', 'plugin:mdx/recommended'],
  plugins: ['import', 'prettier'],
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
      },
    },
  },
  rules: {
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/camelcase': 'off',
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/no-namespace': 'off',
    camelcase: 'off',
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
    'import/no-named-as-default-member': 'off',
    // turn on errors for missing imports
    'import/no-unresolved': 'error',
    'jest/no-export': 'off',
    'jest/no-standalone-expect': 'off',
    'mdx/no-unescaped-entities': 'off',
    'mdx/no-unused-expressions': 'off',
    'no-alert': 'off',
    'react/jsx-filename-extension': [
      'error',
      { extensions: ['.js', '.jsx', '.ts', '.tsx', 'mdx'] },
    ],
  },
  overrides: [
    {
      files: 'packages/**/*',
      rules: {
        'no-restricted-imports': [
          'error',
          {
            paths: [
              {
                name: '@styled-icons',
                message:
                  '@styled-icons package is meant to be used in stories only',
              },
            ],
            // The no-restricted-imports rule does not support custom messages for pattern imports yet: https://github.com/eslint/eslint/issues/11843
            patterns: ['@styled-icons/*'],
          },
        ],
      },
    },
    {
      files: 'packages/**/__tests__/*',
      rules: {
        'no-restricted-imports': [
          'error',
          {
            paths: [],
          },
        ],
      },
    },
    {
      files: '**/*.stories.tsx',
      rules: {
        // just for showing the code in addon-docs
        'react-hooks/rules-of-hooks': 'off',
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
  ],
};
