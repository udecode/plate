import base from './configs/base.js';
import next from './configs/next.js';
import prettier from './configs/prettier.js';
import react from './configs/react.js';
import { getTailwindConfig } from './configs/tailwind.js';

export { compat, defineConfig } from './utils.js';

export const filePatterns = {
  js: ['*.js', '*.cjs'],
  jsx: ['*.{js,jsx,ts,tsx}'],
  react: ['*.{jsx,tsx}'],
  test: ['**/__tests__/**', '**/*.test.*', '**/*.spec.*', '**/*.fixture.*'],
  ts: ['*.ts', '*.tsx', '*.mts'],
};

/**
 * Note: You MUST import files using the .js extension in this entire package
 * (not only this file) otherwise ESLint will not be able to resolve the files.
 */
export const configs = {
  base,
  filePatterns,
  getTailwind: getTailwindConfig,
  next,
  prettier,
  react,
};
