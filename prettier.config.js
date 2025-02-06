import config from './tooling/eslint/src/configs/prettier.base.config.js';

/** @type {import('prettier').Config} */
export default {
  ...config,
  tailwindStylesheet: './apps/www/src/styles/globals.css',
};
