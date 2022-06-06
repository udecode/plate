module.exports = function plugin(context, { alias }) {
  return {
    name: 'docusaurus-plugin-local-resolve',
    configureWebpack() {
      const allAliases = {
        'react/jsx-runtime': 'react/jsx-runtime.js',
        'react/jsx-dev-runtime': 'react/jsx-dev-runtime.js',
      };

      if (process.env.NODE_ENV === 'development') {
        return {
          resolve: {
            alias: {
              ...alias,
              ...allAliases,
            },
          },
        };
      }

      return {
        resolve: {
          alias: allAliases,
        },
      };
    },
  };
};
