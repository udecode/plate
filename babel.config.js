module.exports = {
  plugins: [
    'babel-plugin-twin',
    'babel-plugin-macros',
    ['styled-components', { ssr: true }],
  ],
  presets: [
    ['@babel/preset-react', { runtime: 'automatic' }],
    '@babel/preset-typescript',
  ],
  sourceType: 'unambiguous',
};
