module.exports = {
  plugins: [
    'babel-plugin-twin',
    'babel-plugin-macros',
    '@babel/plugin-proposal-class-properties',
    ['styled-components', { ssr: true }],
  ],
  presets: [
    ['@babel/preset-react', { runtime: 'classic' }],
    '@babel/preset-typescript',
  ],
  sourceType: 'unambiguous',
};
