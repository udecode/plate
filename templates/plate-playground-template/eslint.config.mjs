import tsParser from '@typescript-eslint/parser';
import { defineConfig } from 'eslint/config';
import reactHooks from 'eslint-plugin-react-hooks';

export default defineConfig([
  {
    ignores: ['node_modules/**', '.next/**'],
  },
  {
    ...reactHooks.configs.flat.recommended,
    files: ['src/**/*.tsx', 'src/**/use*.ts'],
    languageOptions: { parser: tsParser },
  },
]);
