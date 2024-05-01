module.exports = {
  extends: ['plugin:perfectionist/recommended-natural'],
  plugins: ['perfectionist'],
  rules: {
    'adjacent-overload-signatures': 'off',

    'jsx-sort-props': 'off',

    'perfectionist/sort-array-includes': [
      'warn',
      {
        'spread-last': true,
        type: 'natural',
      },
    ],
    'perfectionist/sort-astro-attributes': ['warn', { type: 'natural' }],
    'perfectionist/sort-classes': [
      'warn',
      {
        groups: [
          'index-signature',
          'static-property',
          'private-property',
          'property',
          'constructor',
          'static-method',
          'private-method',
          'method',
          ['get-method', 'set-method'],
          'unknown',
        ],
        type: 'natural',
      },
    ],
    'perfectionist/sort-enums': ['warn', { type: 'natural' }],
    'perfectionist/sort-exports': ['warn', { type: 'natural' }],
    'perfectionist/sort-imports': [
      // 'off',
      'warn',
      {
        'custom-groups': {
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
        'internal-pattern': ['@/**'],
        type: 'natural',
      },
    ],
    'perfectionist/sort-interfaces': [
      'warn',
      { 'optionality-order': 'required-first', type: 'natural' },
    ],
    'perfectionist/sort-intersection-types': [
      'warn',
      {
        order: 'asc',
        type: 'natural',
      },
    ],
    'perfectionist/sort-jsx-props': ['warn', { type: 'natural' }],
    'perfectionist/sort-maps': ['warn', { type: 'natural' }],
    'perfectionist/sort-named-exports': ['warn', { type: 'natural' }],
    // 'perfectionist/sort-named-imports': ['off'],
    'perfectionist/sort-named-imports': ['warn', { type: 'natural' }],
    'perfectionist/sort-object-types': ['warn', { type: 'natural' }],
    'perfectionist/sort-objects': [
      'warn',
      {
        'partition-by-comment': false,
        type: 'natural',
      },
    ],
    'perfectionist/sort-svelte-attributes': ['warn', { type: 'natural' }],
    'perfectionist/sort-union-types': ['warn', { type: 'natural' }],
    'perfectionist/sort-vue-attributes': ['warn', { type: 'natural' }],
    'sort-imports': 'off',
    'sort-keys': 'off',
    'sort-type-constituents': 'off',
  },
};
