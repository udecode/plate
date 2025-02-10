import perfectionist from 'eslint-plugin-perfectionist';

import { defineConfig } from '../utils.js';

export default defineConfig(
  perfectionist.configs['recommended-natural'],
  {
    rules: {
      '@typescript-eslint/adjacent-overload-signatures': 'off',
      'perfectionist/sort-array-includes': [
        'warn',
        {
          groupKind: 'literals-first',
          type: 'natural',
        },
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
          type: 'natural',
        },
      ],
      'perfectionist/sort-decorators': [
        'warn',
        {
          type: 'natural',
        },
      ],
      'perfectionist/sort-enums': [
        'warn',
        {
          sortByValue: true,
          type: 'natural',
        },
      ],
      'perfectionist/sort-exports': [
        'warn',
        {
          groupKind: 'types-first',
          type: 'natural',
        },
      ],
      'perfectionist/sort-heritage-clauses': [
        'warn',
        {
          type: 'natural',
        },
      ],
      'perfectionist/sort-imports': [
        'warn',
        {
          customGroups: {
            type: {
              next: '^next$',
              react: '^react$',
            },
            value: {
              next: ['^next$'],
              react: ['^react$', '^react-.*$'],
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
          internalPattern: ['^@/.*'],
          type: 'natural',
        },
      ],
      'perfectionist/sort-interfaces': [
        'warn',
        {
          customGroups: {
            key: ['^key$', '^keys$'],
            id: ['^id$', '^_id$'],
          },
          groupKind: 'required-first',
          groups: [
            'key',
            'id',
            'unknown',
            // 'multiline',
            'method',
          ],
          partitionByComment: true,

          type: 'natural',
        },
      ],
      // breaking: ordering matters
      'perfectionist/sort-intersection-types': 'off',
      'perfectionist/sort-jsx-props': [
        'warn',
        {
          customGroups: {
            key: ['^key$', '^keys$'],
            id: ['^id$', '^name$', '^testId$', '^data-testid$'],
            accessibility: [
              '^title$',
              '^alt$',
              '^placeholder$',
              '^label$',
              '^description$',
              '^fallback$',
            ],
            callback: ['^on[A-Z]', '^handle[A-Z]'],
            className: ['^className$', '^class$', '^style$'],
            control: ['^asChild$', '^as$'],
            data: ['^data-*', '^aria-*'],
            ref: ['^ref$', '^innerRef$'],
            state: [
              '^value$',
              '^checked$',
              '^selected$',
              '^open$',
              '^defaultValue$',
              '^defaultChecked$',
              '^defaultOpen$',
              '^disabled$',
              '^required$',
              '^readOnly$',
              '^loading$',
            ],
            variant: ['^variant$', '^size$', '^orientation$', '^color$'],
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
          type: 'natural',
        },
      ],
      'perfectionist/sort-modules': [
        'warn',
        {
          groups: [
            'declare-enum',
            'export-enum',
            'enum',
            ['declare-interface', 'declare-type'],
            ['export-interface', 'export-type'],
            ['interface', 'type'],
            'declare-class',
            'class',
            'export-class',

            // 'declare-function',
            // 'export-function',
            // 'function',

            // 'unknown',
          ],
          type: 'natural',
        },
      ],
      'perfectionist/sort-named-exports': [
        'warn',
        {
          groupKind: 'types-first',
          type: 'natural',
        },
      ],
      'perfectionist/sort-named-imports': [
        'warn',
        {
          groupKind: 'types-first',
          type: 'natural',
        },
      ],
      'perfectionist/sort-object-types': [
        'warn',
        {
          customGroups: {
            key: ['^key$', '^keys$'],
            id: ['^id$', '^_id$'],
            callback: ['^on[A-Z]', '^handle[A-Z]'],
          },
          groupKind: 'required-first',
          groups: [
            'key',
            'id',
            'unknown',
            // 'multiline',
            'method',
            'callback',
          ],
          newlinesBetween: 'never',
          type: 'natural',
        },
      ],
      'perfectionist/sort-objects': [
        'warn',
        {
          customGroups: {
            key: ['^key$', '^keys$'],
            id: ['^id$', '^_id$'],
            callback: ['^on[A-Z]', '^handle[A-Z]'],
          },
          groups: [
            'key',
            'id',
            'unknown',
            // 'multiline',
            'method',
            'callback',
          ],
          // newlinesBetween: 'never',
          type: 'natural',
        },
      ],
      'perfectionist/sort-sets': [
        'warn',
        {
          type: 'natural',
        },
      ],
      'perfectionist/sort-switch-case': [
        'warn',
        {
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
          type: 'natural',
        },
      ],
      'perfectionist/sort-variable-declarations': [
        'warn',
        {
          type: 'natural',
        },
      ],
      'react/jsx-sort-props': 'off',
      'sort-imports': 'off',

      'sort-keys': 'off',
    },
    settings: {
      perfectionist: {
        ignoreCase: false,
      },
    },
  },
  {
    files: ['index.ts*'],
    rules: {
      'perfectionist/sort-exports': 'off',
    },
  }
);
