/** @type {import('next').NextConfig} */
module.exports = {
  experimental: { esmExternals: 'loose' },
  webpack: (config) => {
    const allAliases = {
      'react/jsx-runtime.js': 'react/jsx-runtime',
      'react/jsx-dev-runtime.js': 'react/jsx-dev-runtime',
      '@udecode/plate-ui-dnd/index.js': '@udecode/plate-ui-dnd/index.es.js',
      '../../packages/ui/dnd/dist/index.js':
        '../../packages/ui/dnd/dist/index.es.js',
      '../../packages/ui/plate/dist/index.js':
        '../../packages/ui/plate/dist/index.es.js',
    };
    config.resolve.alias = { ...config.resolve.alias, ...allAliases };
    return config;
  },
};
