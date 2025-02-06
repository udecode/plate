/** @type {import('prettier').Config} */
export default {
  endOfLine: 'lf',
  plugins: [
    'prettier-plugin-packagejson',
    'prettier-plugin-tailwindcss',
  ],
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  tailwindFunctions: ['cn', 'cva', 'withCn'],
  tailwindStylesheet: '../../apps/www/src/styles/globals.css',
  trailingComma: 'es5',
};
