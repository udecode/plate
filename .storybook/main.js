const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const path = require('path');

module.exports = {
  stories: [
    '../stories/docs/**/intro.stories.mdx',
    '../stories/docs/**/getting-started.stories.mdx',
    '../stories/docs/**/guide.stories.mdx',
    '../stories/docs/**/contributing.stories.mdx',
    '../stories/**/*.stories.@(tsx|mdx)',
  ],
  addons: [
    '@storybook/addon-knobs',
    '@storybook/addon-docs',
    '@storybook/addon-storysource'
  ],
  typescript: {
    check: false,
    checkOptions: {},
    // reactDocgen: false,
    reactDocgen: 'react-docgen-typescript',
  },
  webpackFinal: async (config) => {
    // config.module.rules.push({
    //   test: (modulePath) => {
    //     return !modulePath.includes('test')
    //       && !modulePath.includes('spec')
    //       && (modulePath.endsWith('ts') || modulePath.endsWith('tsx'))
    //   } ,
    //   use: [
    //     {
    //       loader: require.resolve('babel-loader'),
    //       options: {
    //         rootMode: 'upward',
    //       },
    //     },
    //     {
    //       loader: require.resolve('ts-loader'),
    //       options: {
    //         configFile: path.resolve(__dirname, 'tsconfig.json'),
    //         transpileOnly: true,
    //       },
    //     },
    //     {
    //       loader: require.resolve('react-docgen-typescript-loader'),
    //     },
    //   ],
    // });

    config.resolve.plugins = [
        new TsconfigPathsPlugin({
          configFile: path.resolve(__dirname, "./tsconfig.json")
        })
      ];

    config.resolve.modules = [
      ...(config.resolve.modules || []),
      path.resolve(__dirname, '../packages/slate-plugins/src'),
    ];

    config.resolve.alias = {
      "@udecode/slate-plugins": path.resolve(__dirname, "..", "packages/slate-plugins/src"),
    };

    config.resolve.extensions.push('.ts', '.tsx');

    return config;
  }
}