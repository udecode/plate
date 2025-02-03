import { fixupConfigRules } from '@eslint/compat';

import { compat, defineConfig } from '../utils.js';

export const getTailwindConfig = ({
  config,
  // cssFiles = '**/*.css'
} = {}) =>
  defineConfig(
    ...fixupConfigRules(compat.extends('plugin:tailwindcss/recommended')),
    {
      rules: {
        'tailwindcss/no-custom-classname': 'off',
      },
    },
    {
      files: ['apps/www/**/*.tsx'],
      rules: {
        'tailwindcss/classnames-order': 'warn',
        'tailwindcss/no-custom-classname': [
          'error',
          {
            whitelist: [
              'ignore-click-outside/toolbar',
              'menu-item-icon',
              'active',
              'mixin',
              'toaster',
              'preview',
              'chunk-mode',
              'typography',
              'step',
              'steps',
              'no-focus-ring',
              'focus-ring',
              'line',
            ],
          },
        ],
      },
      settings: {
        tailwindcss: {
          callees: ['cn', 'cva', 'withCn', 'className'],
          config,
          cssFiles: [
            // cssFiles,
            // '!**/node_modules',
            // '!**/.*',
            // '!**/dist',
            // '!**/build',
          ],
        },
      },
    }
  );
