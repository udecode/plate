module.exports = {
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-export-namespace-from',
  ],
  presets: [
    ['@babel/preset-react', { runtime: 'classic' }],
    '@babel/preset-typescript',
  ],
  sourceType: 'unambiguous',
};
