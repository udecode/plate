module.exports = {
  out: './docs',
  readme: './README.md',
  theme: 'minimal',
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
  excludePrivate: true,
  ignoreCompilerErrors: true,
  name: '@udecode/slate-plugins',
  includeVersion: true,
};
