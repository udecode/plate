const babelConfig = require('../babel.config');

module.exports = {
  plugins: [...babelConfig.plugins, '@babel/plugin-transform-modules-commonjs'],
  presets: [
    ...babelConfig.presets,
    require.resolve('@docusaurus/core/lib/babel/preset'),
  ],
};
