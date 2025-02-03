import globals from 'globals';

import { defineConfig } from '../utils.js';
import jestConfig from './jest.js';
import perfectionistConfig from './perfectionist.js';
import rtlConfig from './rtl.js';
import securityConfig from './security.js';
import typescriptConfig from './typescript.js';
import unicornConfig from './unicorn.js';

export default defineConfig(
  {
    ignores: [
      '.next',
      '.vercel',
      '.astro',
      'dist',
      'storybook-static',
      '.tsup',
      `**/${'node'}_modules`,
      '.cache',
      '**/.cache',
      '**/build',
      '**/dist',
      '**/bundled',
      '**/.storybook',
      '**/storybook-static',
      '**/vault',
      '**/_vault',
      '**/__*',
      '**/*.mdx',
      '**/index.ts',
    ],
  },

  ...securityConfig,
  ...typescriptConfig,
  ...jestConfig,
  ...rtlConfig,
  ...unicornConfig,
  ...perfectionistConfig,

  {
    files: ['**/*.cjs'],
    languageOptions: {
      sourceType: 'commonjs',
    },
  },

  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    rules: {
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  }
);
