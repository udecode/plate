module.exports = {
  plugins: [
    'babel-plugin-twin',
    'babel-plugin-macros',
    ['styled-components', { ssr: true }],
  ],
  presets: [
    ['@babel/preset-react', { runtime: 'classic' }],
    '@babel/preset-typescript',
  ],
  sourceType: 'unambiguous',
};
