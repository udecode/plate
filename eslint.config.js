import { configs, defineConfig, filePatterns } from '@app/eslint';

export default defineConfig(
  {
    ignores: [
      'scripts/**/*',
      '**/.contentlayer/*',
      '**/__registry__/*',
      '**/build-registry.mts',
      'packages/cli/src',
      'prisma/kysely',
      'src/lib/db/types',
      '**/*.mdx',
    ],
  },
  ...configs.base,
  // ...configs.getTailwind(),
  ...configs.next,
  // ...configs.prettier,
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['**/registry/default/**/*'],
    rules: {
      'jsx-a11y/iframe-has-title': 'off',
      'jsx-a11y/media-has-caption': 'off',
      'react/jsx-no-comment-textnodes': 'off',
    },
  },
  {
    files: ['**/*.spec.ts*', '**/*.spec.tsx'],
    rules: {
      'import/no-relative-packages': 'off',
      'react/jsx-key': 'off',
    },
  },
  {
    // env: {
    //   jest: true,
    // },
    // languageOptions: {
    //   globals: {

    //   }
    // }
    files: filePatterns.test,
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      'no-restricted-imports': [
        'error',
        {
          paths: [],
        },
      ],
      'react-hooks/rules-of-hooks': 'off',
    },
  }
);
