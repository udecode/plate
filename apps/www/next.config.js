const path = require('path');

const alias = require('../../config/aliases');

Object.keys(alias).forEach((key) => {
  alias[key] = path.resolve(__dirname, `../../packages/${alias[key]}/src`);
});

/**
 * @type {import('next').NextConfig}
 */
const config = {
  experimental: {
    // Prefer loading of ES Modules over CommonJS
    // @link {https://nextjs.org/blog/next-11-1#es-modules-support|Blog 11.1.0}
    // @link {https://github.com/vercel/next.js/discussions/27876|Discussion}
    esmExternals: true,
    // Experimental monorepo support
    // @link {https://github.com/vercel/next.js/pull/22867|Original PR}
    // @link {https://github.com/vercel/next.js/discussions/26420|Discussion}
    externalDir: true,
  },
  webpack(cfg) {
    cfg.resolve.alias = {
      ...cfg.resolve.alias,
      ...alias,
    };
    return cfg;
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = config;
