/**
 * @type {import('prettier').Config}
 */
module.exports = {
  // Set the line ending to `lf`.
  // https://prettier.io/docs/en/options.html#end-of-line
  endOfLine: 'lf',

  // Do not add semicolons at the end of statements.
  // https://prettier.io/docs/en/options.html#semicolons
  semi: true,

  // Use single quotes for string literals.
  // https://prettier.io/docs/en/options.html#quotes
  singleQuote: true,

  // Set the tab width to 2 spaces.
  // https://prettier.io/docs/en/options.html#tab-width
  tabWidth: 2,

  // Add trailing commas for object and array literals in ES5-compatible mode.
  // https://prettier.io/docs/en/options.html#trailing-commas
  trailingComma: 'es5',

  // Define the order in which imports should be sorted, with specific patterns for React, Next.js, third-party modules, local modules, and relative imports.
  importOrder: [
    '^(react/(.*)$)|^(react$)',
    '^(next/(.*)$)|^(next$)',
    '<THIRD_PARTY_MODULES>',
    '',
    '^types$',
    '^@/types/(.*)$',
    '^@/config/(.*)$',
    '^@/lib/(.*)$',
    '^@/hooks/(.*)$',
    '^@/components/ui/(.*)$',
    '^@/components/(.*)$',
    '^@/registry/(.*)$',
    '^@/styles/(.*)$',
    '^@/app/(.*)$',
    '',
    '^[./]',
  ],

  // Do not separate imports by empty lines.
  importOrderSeparation: false,

  // Sort import specifiers alphabetically.
  importOrderSortSpecifiers: true,

  // Move built-in modules to the top of the import list.
  importOrderBuiltinModulesToTop: true,

  // Specify the parser plugins to use for import sorting.
  importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],

  // Merge duplicate imports into a single statement.
  importOrderMergeDuplicateImports: true,

  // Combine type-only imports with value imports.
  importOrderCombineTypeAndValueImports: true,

  // Use the `@ianvs/prettier-plugin-sort-imports` plugin to sort imports.
  // https://github.com/ianvs/prettier-plugin-sort-imports
  plugins: ['@ianvs/prettier-plugin-sort-imports'],
};
