const babelConfig = require('../config/babel.config.cjs');

module.exports = {
  plugins: [
    ...babelConfig.plugins,
    '@babel/plugin-transform-modules-commonjs',
    ['@babel/plugin-proposal-private-property-in-object', { loose: false }],
    ['@babel/plugin-proposal-private-methods', { loose: false }],
  ],
  presets: [
    ...babelConfig.presets,
    require.resolve('@docusaurus/core/lib/babel/preset'),
  ],
};
