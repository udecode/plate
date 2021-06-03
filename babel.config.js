module.exports = {
  plugins: [
    'babel-plugin-macros',
    ['styled-components', { ssr: true }],
    '@babel/plugin-transform-react-jsx',
  ],
  presets: ['@babel/preset-react', '@babel/preset-typescript'],
  sourceType: 'unambiguous',
};
