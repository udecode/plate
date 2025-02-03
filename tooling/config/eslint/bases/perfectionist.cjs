/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ['plugin:perfectionist/recommended-natural-legacy'],
  overrides: [
    {
      files: ['index.ts*'],
      rules: {
        'perfectionist/sort-exports': 'off',
      },
    },
  ],
  plugins: ['perfectionist'],
  rules: {
    '@typescript-eslint/adjacent-overload-signatures': 'off',

    'perfectionist/sort-array-includes': [
      'warn',
      {
        groupKind: 'literals-first',
        ignoreCase: false,
        type: 'natural',
      },
    ],

    'perfectionist/sort-astro-attributes': [
      'warn',
      { ignoreCase: false, type: 'natural' },
    ],
    'perfectionist/sort-classes': [
      'warn',
      {
        groups: [
          'index-signature',
          'static-property',
          'private-property',
          'protected-property',
          'property',
          'constructor',
          'static-method',
          'private-method',
          'protected-method',
          'method',
          ['get-method', 'set-method'],
          'static-block',
          'unknown',
        ],
        ignoreCase: false,
        type: 'natural',
      },
    ],
    'perfectionist/sort-enums': [
      'warn',
      {
        ignoreCase: false,
        sortByValue: true,
        type: 'natural',
      },
    ],
    'perfectionist/sort-exports': [
      'warn',
      { ignoreCase: false, type: 'natural' },
    ],
    'perfectionist/sort-imports': [
      // 'off',
      'warn',
      {
        customGroups: {
          type: {
            next: 'next',
            react: 'react',
          },
          value: {
            next: ['next'],
            react: ['react', 'react-*'],
          },
        },
        groups: [
          'react',
          ['type', 'internal-type'],
          'next',
          ['builtin', 'external'],
          'internal',
          ['parent-type', 'sibling-type', 'index-type'],
          ['parent', 'sibling', 'index'],
          'side-effect',
          'style',
          'object',
          'unknown',
        ],
        ignoreCase: false,
        internalPattern: ['@/**'],
        type: 'natural',
      },
    ],
    'perfectionist/sort-interfaces': [
      'warn',
      {
        customGroups: {
          key: ['key', 'keys'],
          id: ['id', '_id'],
        },
        groupKind: 'required-first',
        groups: ['key', 'id', 'multiline', 'unknown'],
        ignoreCase: false,
        type: 'natural',
      },
    ],
    // breaking: ordering matters
    'perfectionist/sort-intersection-types': 'off',
    'perfectionist/sort-jsx-props': [
      'warn',
      {
        customGroups: {
          key: ['key', 'keys'],
          id: ['id', 'name', 'testId', 'data-testid'],
          accessibility: [
            'title',
            'alt',
            'placeholder',
            'label',
            'description',
            'fallback',
          ],
          callback: ['on*', 'handle*'],
          className: ['className', 'class', 'style'],
          control: ['asChild', 'as'],
          data: ['data-*', 'aria-*'],
          ref: ['ref', 'innerRef'],
          state: [
            'value',
            'checked',
            'selected',
            'open',
            'defaultValue',
            'defaultChecked',
            'defaultOpen',
            'disabled',
            'required',
            'readOnly',
            'loading',
          ],
          variant: ['variant', 'size', 'orientation', 'color'],
        },
        groups: [
          'id',
          'key',
          'ref',
          'control',
          'variant',
          'className',
          'state',
          'callback',
          'accessibility',
          'data',
          'unknown',
          'shorthand',
        ],
        ignoreCase: false,
        type: 'natural',
      },
    ],
    'perfectionist/sort-maps': ['warn', { ignoreCase: false, type: 'natural' }],
    'perfectionist/sort-named-exports': [
      'warn',
      { groupKind: 'types-first', ignoreCase: false, type: 'natural' },
    ],
    // 'perfectionist/sort-named-imports': ['off'],
    'perfectionist/sort-named-imports': [
      'warn',
      { groupKind: 'types-first', ignoreCase: false, type: 'natural' },
    ],
    'perfectionist/sort-object-types': [
      'warn',
      {
        customGroups: {
          key: ['key', 'keys'],
          id: ['id', '_id'],
          callback: ['on*', 'handle*'],
        },
        groupKind: 'required-first',
        groups: ['key', 'id', 'multiline', 'unknown', 'callback'],
        ignoreCase: false,
        type: 'natural',
      },
    ],
    'perfectionist/sort-objects': [
      'warn',
      {
        customGroups: {
          key: ['key', 'keys'],
          id: ['id', '_id'],
          callback: ['on*', 'handle*'],
        },
        groups: ['key', 'id', 'unknown', 'callback'],
        ignoreCase: false,
        type: 'natural',
      },
    ],
    'perfectionist/sort-sets': [
      'warn',
      {
        ignoreCase: false,
        type: 'natural',
      },
    ],
    'perfectionist/sort-switch-case': [
      'warn',
      {
        ignoreCase: false,
        type: 'natural',
      },
    ],
    'perfectionist/sort-union-types': [
      'warn',
      {
        groups: [
          'conditional',
          'function',
          'import',
          ['intersection', 'union'],
          'named',
          'operator',
          'object',
          'keyword',
          'literal',
          'tuple',
          'nullish',
          'unknown',
        ],
        ignoreCase: false,
        type: 'natural',
      },
    ],
    'perfectionist/sort-variable-declarations': [
      'warn',
      {
        ignoreCase: false,
        type: 'natural',
      },
    ],
    'react/jsx-sort-props': 'off',
    'sort-imports': 'off',
    'sort-keys': 'off',
  },
};
