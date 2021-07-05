const babelConfig = require('../babel.config');

module.exports = {
  presets: [
    ...babelConfig.presets,
    require.resolve('@docusaurus/core/lib/babel/preset'),
  ],
  plugins: [...babelConfig.plugins, '@babel/plugin-transform-modules-commonjs'],
};
