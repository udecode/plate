/** @type {import('prettier').Config} */
export default {
  // Set the line ending to `lf`.
  // https://prettier.io/docs/en/options.html#end-of-line
  endOfLine: 'lf',

  // Do not add semicolons at the end of statements.
  // Define the order in which imports should be sorted, with specific patterns for React, Next.js, third-party modules, local modules, and relative imports.
  // importOrder: [
  //   '^(react/(.*)$)|^(react$)',
  //   '',
  //   '<TYPES>',
  //   '',
  //   '^(next/(.*)$)|^(next$)',
  //   '<BUILTIN_MODULES>',
  //   '<THIRD_PARTY_MODULES>',
  //   '',
  //   '^@/(.*)$',
  //   '^[.]',
  // ],

  // Use single quotes for string literals.
  // Specify the parser plugins to use for import sorting.
  importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],

  // Set the tab width to 2 spaces.
  importOrderTypeScriptVersion: '5.4.5',

  // Add trailing commas for object and array literals in ES5-compatible mode.
  // https://github.com/ianvs/prettier-plugin-sort-imports
  plugins: [
    // '@ianvs/prettier-plugin-sort-imports',
    'prettier-plugin-packagejson',
    'prettier-plugin-jsdoc',
  ],

  // https://prettier.io/docs/en/options.html#semicolons
  semi: true,
  // https://prettier.io/docs/en/options.html#quotes
  singleQuote: true,
  // https://prettier.io/docs/en/options.html#tab-width
  tabWidth: 2,
  // Use the `@ianvs/prettier-plugin-sort-imports` plugin to sort imports.
  // https://prettier.io/docs/en/options.html#trailing-commas
  trailingComma: 'es5',
};
