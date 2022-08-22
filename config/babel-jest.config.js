module.exports = {
  plugins: [
    'babel-plugin-twin',
    'babel-plugin-macros',
    ['babel-plugin-styled-components', { ssr: true }],
  ],
  presets: ['@babel/preset-env'],
};
