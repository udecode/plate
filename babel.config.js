module.exports = {
  plugins: [
    'babel-plugin-twin',
    'babel-plugin-macros',
    '@babel/plugin-transform-react-jsx',
  ],
  presets: ['@babel/preset-env'],
  sourceType: 'unambiguous',
};
