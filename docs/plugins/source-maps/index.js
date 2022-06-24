module.exports = function plugin() {
  return {
    name: 'docusaurus-plugin-source-maps',
    configureWebpack() {
      if (process.env.NODE_ENV === 'development') {
        return {
          devtool: 'source-map',
        };
      }

      return {};
    },
  };
};
