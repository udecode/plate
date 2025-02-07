/** @type {import('prettier').Config} */
export default {
  endOfLine: 'lf',
  plugins: ['prettier-plugin-packagejson', 'prettier-plugin-tailwindcss'],
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  tailwindFunctions: ['cn', 'cva', 'withCn'],
  tailwindStylesheet: './src/app/globals.css',
  trailingComma: 'es5',
};
