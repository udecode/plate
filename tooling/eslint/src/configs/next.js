import nextPlugin from '@next/eslint-plugin-next';

import { defineConfig } from '../utils.js';
import reactConfig from './react.js';

export default defineConfig(...reactConfig, nextPlugin.configs.recommended, {
  rules: {
    '@next/next/no-html-link-for-pages': 'off',
    // https://github.com/vercel/next.js/discussions/16832
    '@next/next/no-img-element': 'off',
  },
});
