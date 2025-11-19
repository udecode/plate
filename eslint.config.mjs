import tsParser from '@typescript-eslint/parser';
import { defineConfig } from 'eslint/config';
import reactHooks from 'eslint-plugin-react-hooks';

export default defineConfig([
  {
    ...reactHooks.configs.flat.recommended,
    files: ['**/*.ts*'],
    languageOptions: { parser: tsParser },
  },
  {
    ignores: [
      'scripts/**/*',
      '.claude/**/*',
      '**/.contentlayer/*',
      '**/__registry__/*',
      '**/build-registry.mts',
      'packages/cli/src',
      'packages/depset/tsup.config.ts',
      'prisma/kysely',
      'src/lib/db/types',
      '**/*.mdx',
      '**/blocks/fumadocs/**/*',
    ],
  },
  {
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
  },
]);
