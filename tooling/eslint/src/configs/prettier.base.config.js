/** @type {import('prettier').Config} */
export default {
  // Set the line ending to `lf`.
  // https://prettier.io/docs/en/options.html#end-of-line
  endOfLine: 'lf',

  // Add trailing commas for object and array literals in ES5-compatible mode.
  // https://github.com/ianvs/prettier-plugin-sort-imports
  plugins: [
    'prettier-plugin-packagejson',
    'prettier-plugin-jsdoc',
    'prettier-plugin-tailwindcss',
  ],

  // https://prettier.io/docs/en/options.html#semicolons
  semi: true,
  // https://prettier.io/docs/en/options.html#quotes
  singleQuote: true,
  // https://prettier.io/docs/en/options.html#tab-width
  tabWidth: 2,

  tailwindFunctions: ['cn', 'cva', 'withCn'],
  tailwindStylesheet: '../../apps/www/src/styles/globals.css',

  // https://prettier.io/docs/en/options.html#trailing-commas
  trailingComma: 'es5',
};
