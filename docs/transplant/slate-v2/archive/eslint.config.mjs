import tsParser from '@typescript-eslint/parser'
import { defineConfig } from 'eslint/config'
import reactHooks from 'eslint-plugin-react-hooks'

export default defineConfig([
  {
    ignores: [
      '**/node_modules/**',
      '**/.turbo/**',
      '**/.next/**',
      '**/dist/**',
      '**/lib/**',
      '**/build/**',
      '**/coverage/**',
      '**/playwright-report/**',
      '**/test-results/**',
      '**/test/**/*.js',
      '**/*.config.*',
      '**/*.d.ts',
    ],
  },
  {
    ...reactHooks.configs.flat.recommended,
    files: [
      'packages/slate-react/src/**/*.{ts,tsx,js,jsx}',
      'site/**/*.{tsx,jsx}',
    ],
    languageOptions: { parser: tsParser },
    rules: {
      ...reactHooks.configs.flat.recommended.rules,
      'react-hooks/immutability': 'off',
    },
  },
])
