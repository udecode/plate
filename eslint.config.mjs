import tsParser from '@typescript-eslint/parser';
import { defineConfig } from 'eslint/config';
import reactHooks from 'eslint-plugin-react-hooks';

export default defineConfig([
  {
    ignores: [
      '**/.yarn/**',
      '**/*.spec.*',
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/build/**',
      '**/.turbo/**',
      '**/coverage/**',
      '**/templates/**',
      '**/.contentlayer/**',
      '**/public/**',
      '**/*.config.*',
      '**/*.d.ts',
      '.changeset/**',
      'tooling/**',
      'packages/docx-io/tmp'
    ],
  },
  // React Hooks config for apps/www (React 19 with React Compiler)
  {
    ...reactHooks.configs.flat.recommended,
    files: [
      'apps/www/src/**/*.tsx',
      'apps/www/src/**/use*.ts',
      'packages/**/src/**/*.tsx',
      'packages/**/src/**/use*.ts',
    ],
    languageOptions: { parser: tsParser },
  },
  // Disable React Compiler rules for packages (React 18 compatibility)
  {
    files: ['packages/**'],
    rules: {
      'react-hooks/immutability': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
    },
  },
]);
