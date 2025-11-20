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
    ],
  },
  {
    ...reactHooks.configs.flat.recommended,
    // Only lint React component files (.tsx) and hook files (use*.ts)
    files: [
      'apps/**/src/**/*.tsx',
      'apps/**/src/**/use*.ts',
      'packages/**/src/**/*.tsx',
      'packages/**/src/**/use*.ts',
    ],
    languageOptions: { parser: tsParser },
  },
]);
