const path = require('path');

module.exports = ({ config }) => {
  config.module.rules.push({
    test: /\.(ts|tsx)$/,
    use: [
      {
        loader: require.resolve('awesome-typescript-loader'),
      },
      {
        loader: require.resolve('react-docgen-typescript-loader'),
      },
    ],
  });
  
  // config.module.rules.push({
  //   test: /\.stories\.tsx?$/,
  //   loaders: [
  //     {
  //       loader: require.resolve('@storybook/source-loader'),
  //       options: { parser: 'typescript' },
  //     },
  //   ],
  //   enforce: 'pre',
  // });
  
  config.resolve.modules = [
    ...(config.resolve.modules || []),
    path.resolve(__dirname, '../src'),
  ];
  
  config.resolve.extensions.push('.ts', '.tsx');
  
  return config;
};
  