export const facts = () => [
  typeof require,
  require.resolve('../common.cjs'),
  module.require('../common.cjs'),
];

export const factory = {
  require(key: string) {
    return key;
  },
};
