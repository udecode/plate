module.exports = function plugin(context, options) {
  console.log('PLUGIN: docusaurus-plugin-source-maps');
  return {
    name: 'docusaurus-plugin-source-maps',
    configureWebpack() {
      if (true) {
        return {
          devtool: 'source-map',
        };
      }

      return {};
    },
  };
};
