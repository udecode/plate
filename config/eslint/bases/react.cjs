/**
 * Opinionated config base for projects using react.
 * @see https://github.com/belgattitude/nextjs-monorepo-example/tree/main/packages/eslint-config-bases
 */

const reactPatterns = {
  files: ['*.{jsx,tsx}'],
};

module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  extends: [
    // @see https://www.npmjs.com/package/eslint-plugin-react-hooks
    'plugin:react-hooks/recommended',
    'plugin:mdx/recommended',
  ],
  rules: {
    'react-hooks/rules-of-hooks': 'error', // Checks rules of Hooks
    'react-hooks/exhaustive-deps': 'warn', // Checks effect dependencies
  },
  overrides: [
    {
      files: reactPatterns.files,
      extends: [
        // @see https://github.com/yannickcr/eslint-plugin-react
        'plugin:react/recommended',
        // @see https://github.com/jsx-eslint/eslint-plugin-jsx-a11y
        'plugin:jsx-a11y/recommended',
      ],
      rules: {
        'jsx-a11y/anchor-has-content': 'off',
        'jsx-a11y/anchor-is-valid': 'off',

        // For the sake of example
        // https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/HEAD/docs/rules/anchor-is-valid.md
        'jsx-a11y/click-events-have-key-events': 'off',
        'jsx-a11y/heading-has-content': 'off',
        'jsx-a11y/label-has-associated-control': 'off',
        'jsx-a11y/label-has-for': 'off',
        'jsx-a11y/no-autofocus': 'off',
        'jsx-a11y/no-static-element-interactions': 'off',
        'mdx/no-unescaped-entities': 'off',
        'mdx/no-unused-expressions': 'off',

        'react-hooks/exhaustive-deps': 'warn',
        'react-hooks/rules-of-hooks': 'error',
        'react/button-has-type': [
          'error',
          {
            reset: true,
          },
        ],
        'react/jsx-curly-brace-presence': [
          'warn',
          { props: 'never', children: 'never' },
        ],
        'react/jsx-filename-extension': [
          'error',
          { extensions: ['.js', '.jsx', '.ts', '.tsx', 'mdx'] },
        ],
        'react/jsx-no-useless-fragment': ['warn', { allowExpressions: true }],
        'react/jsx-pascal-case': 'off',
        'react/jsx-props-no-spreading': 'off',
        'react/jsx-uses-react': 'off',

        'react/no-array-index-key': 'off',
        'react/no-unescaped-entities': ['error', { forbid: ['>'] }],
        'react/no-unknown-property': [
          'error',
          { ignore: ['css', 'cmdk-input-wrapper', 'tw'] },
        ],

        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-unknown-property.md
        'react/no-unused-prop-types': 'off',
        // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/no-unescaped-entities.md
        'react/prop-types': 'off',
        'react/react-in-jsx-scope': 'off',
        'react/require-default-props': 'off',
      },
    },
  ],
};
