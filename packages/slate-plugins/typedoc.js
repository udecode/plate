module.exports = {
  out: './docs',
  readme: './README.md',
  includes: './src',
  exclude: [
    '**/*test*/**',
    '**/*fixture*/**',
    '**/*template*/**',
    '**/*stories*',
    '**/*.development.*',
  ],

  mode: 'file',
  excludeExternals: false,
  excludeNotExported: true,
  ignoreCompilerErrors: true,
  name: '@udecode/slate-plugins',
  includeVersion: true,
};
