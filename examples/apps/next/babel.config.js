const babelConfig = require('../../../config/babel.config');

// module.exports = {
//   plugins: [
//     'babel-plugin-twin',
//     'babel-plugin-macros',
//     '@babel/plugin-proposal-class-properties',
//     '@babel/plugin-proposal-export-namespace-from',
//     ['styled-components', { ssr: true }],
//   ],
//   presets: [
//     ['@babel/preset-react', { runtime: 'classic' }],
//     '@babel/preset-typescript',
//   ],
//   sourceType: 'unambiguous',
// };

module.exports = {
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-export-namespace-from',
    // ...babelConfig.plugins,
    '@babel/plugin-transform-modules-commonjs',
  ],
  presets: [...babelConfig.presets],
};
