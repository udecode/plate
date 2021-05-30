function modifyBabelConfigForDocusaurusContentDocsPlugins(config) {
  const mdxRegex = /(\.mdx?)$/;
  const matchingRules = config.module.rules.filter(
    (rule) => rule.test.toString() === mdxRegex.toString()
  );

  matchingRules.map((rule) => {
    const babelLoaders = rule.use.filter((use) =>
      use.loader.match('babel-loader')
    );
    babelLoaders.map((loader) => {
      loader.options.configFile = join(process.cwd(), 'babel.config.js');
      delete loader.options.presets;
      delete loader.options.babelrc;
    });
  });
}

module.exports = function customWebpackPlugin() {
  return {
    name: 'custom-webpack-plugin',
    configureWebpack(config, isServer, utils) {
      modifyBabelConfigForDocusaurusContentDocsPlugins(config, isServer, utils);
    },
  };
};
