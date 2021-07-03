module.exports = function plugin(context, { alias }) {
  return {
    name: 'docusaurus-plugin-local-resolve',
    configureWebpack() {
      if (process.env.NODE_ENV === 'development') {
        return {
          resolve: {
            alias,
          },
        };
      }

      return {};
    },
  };
};
