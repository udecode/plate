const babelConfig = require('../../config/babel.config');

module.exports = {
  plugins: [...babelConfig.plugins, '@babel/plugin-transform-modules-commonjs'],
  presets: [...babelConfig.presets],
};
