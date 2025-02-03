const {
  getPrettierConfig,
} = require('./config/eslint/helpers/getPrettierConfig.cjs');

const config = getPrettierConfig();

/** @type {import('prettier').Config} */
module.exports = {
  ...config,
  tailwindStylesheet: './apps/www/src/styles/globals.css',
};
