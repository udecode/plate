const baseConfig = require('../../tailwind.config.cjs');

/** @type {import('tailwindcss').Config} */
module.exports = {
  ...baseConfig,
  content: [
    ...baseConfig.content,
    'src/content/**/*.mdx',
    'src/registry/**/*.{ts,tsx}',
  ],
};
