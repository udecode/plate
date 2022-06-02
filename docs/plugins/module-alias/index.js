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
      return {
         resolve: {
            alias: {
                'react/jsx-runtime': 'react/jsx-runtime.js',
                'react/jsx-dev-runtime': 'react/jsx-dev-runtime.js'
            },
          },
      };
    },
  };
};
