/** @type {import('prettier').Config} */
module.exports = {
  // Set the line ending to `lf`.
  // https://prettier.io/docs/en/options.html#end-of-line
  endOfLine: 'lf',

  // Do not add semicolons at the end of statements.
  // Specify the parser plugins to use for import sorting.
  importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],

  // Use single quotes for string literals.
  // Combine type-only imports with value imports.
  importOrderTypeScriptVersion: '5.1.6',

  // Set the tab width to 2 spaces.
  plugins: ['prettier-plugin-packagejson'],

  // Add trailing commas for object and array literals in ES5-compatible mode.
  // https://prettier.io/docs/en/options.html#semicolons
  semi: true,

  // https://prettier.io/docs/en/options.html#quotes
  singleQuote: true,

  // https://prettier.io/docs/en/options.html#tab-width
  tabWidth: 2,

  // https://prettier.io/docs/en/options.html#trailing-commas
  trailingComma: 'es5',
};
