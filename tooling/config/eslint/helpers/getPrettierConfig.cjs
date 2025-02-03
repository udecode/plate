const prettierBaseConfig = require('../prettier.base.config.cjs');

const getPrettierConfig = () => {
  return prettierBaseConfig;
};

module.exports = {
  getPrettierConfig,
};
