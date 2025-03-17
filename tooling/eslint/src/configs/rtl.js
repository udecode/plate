/**
 * Opinionated config base for projects using react-testing-library
 *
 * @see https://github.com/belgattitude/nextjs-monorepo-example/tree/main/packages/eslint-config-bases
 */
import { fixupConfigRules } from '@eslint/compat';

import { compat, defineConfig } from '../utils.js';

const rtlPatterns = {
  files: ['**/?(*.)+(test|spec).{js,jsx,ts,tsx}'],
};

export default defineConfig(
  ...fixupConfigRules(compat.extends('plugin:testing-library/react')),
  {
    rules: {
      'testing-library/no-node-access': 'off',
      'testing-library/prefer-presence-queries': 'off',
      'testing-library/prefer-screen-queries': 'off',
      'testing-library/render-result-naming-convention': 'off',
    },
  },
  {
    // For performance enable react-testing-library only on test files
    files: rtlPatterns.files,
  },
  {
    files: ['**/test-utils.tsx'],
    rules: {
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'import/export': 'off',
    },
  }
);
