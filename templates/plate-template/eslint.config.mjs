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
    rules: {
      ...reactHooks.configs.flat.recommended.rules,
      'react-hooks/refs': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/use-memo': 'off',
    },
  },
]);
