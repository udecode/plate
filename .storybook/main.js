const path = require('path');

module.exports = {
  stories: [
    '../stories/docs/**/intro.stories.mdx',
    '../stories/docs/**/getting-started.stories.mdx',
    '../stories/docs/**/guide.stories.mdx',
    '../stories/docs/**/contributing.stories.mdx',
    '../stories/docs/**/*.stories.(tsx|mdx)',
    '../stories/examples/playground.stories.tsx',
    '../stories/examples/**/*.stories.(tsx|mdx)',
    '../stories/elements/**/*.stories.(tsx|mdx)',
    '../stories/marks/**/*.stories.(tsx|mdx)',
    '../stories/handlers/**/*.stories.(tsx|mdx)',
    '../stories/decorators/**/*.stories.(tsx|mdx)',
    '../stories/normalizers/**/*.stories.(tsx|mdx)',
    '../stories/deserializers/**/*.stories.(tsx|mdx)',
    '../stories/components/**/*.stories.(tsx|mdx)',
    '../stories/widgets/**/*.stories.(tsx|mdx)',
    '../stories/**/*.stories.(tsx|mdx)',
  ],
  addons: [
    '@storybook/addon-knobs',
    '@storybook/addon-docs/preset',
    '@storybook/addon-storysource'
  ],
  webpackFinal: async (config) => {
    config.module.rules.push({
      test: (modulePath) => {
        return !modulePath.includes('test')
          && !modulePath.includes('spec')
          && (modulePath.endsWith('ts') || modulePath.endsWith('tsx'))
      } ,
      use: [
        {
          loader: require.resolve('babel-loader'),
          options: {
            rootMode: 'upward',
          },
        },
        {
          loader: require.resolve('ts-loader'),
          options: {
            configFile: path.resolve(__dirname, 'tsconfig.json'),
            transpileOnly: true,
          },
        },
        {
          loader: require.resolve('react-docgen-typescript-loader'),
        },
      ],
    });

    config.resolve.modules = [
      ...(config.resolve.modules || []),
      path.resolve(__dirname, '../packages/slate-plugins/src'),
    ];

    config.resolve.extensions.push('.ts', '.tsx');

    return config;
  }
}