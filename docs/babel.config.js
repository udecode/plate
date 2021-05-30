const babelConfig = require('../babel.config');

module.exports = {
  ...babelConfig,
  presets: [
    ...babelConfig.presets,
    require.resolve('@docusaurus/core/lib/babel/preset'),
  ],
};
