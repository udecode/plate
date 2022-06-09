const tsJest = require('ts-jest');

const tsJestTransformer = tsJest.createTransformer();
// const tsJestTransformer = tsJest.default.createTransformer();

/**
 * @todo (lucas): this is far from ideal, it removes every tailwind/tw statement to prevent errors in jest
 * that means all our tailwind styles won't be applied in the tests
 * @see https://github.com/kentcdodds/babel-plugin-macros/issues/160
 */
module.exports = {
  ...tsJestTransformer,
  process: (src, filename, jestConfig, ...rest) => {
    const procesedSrc = src
      .replace(/tailwind`.*`/g, '{}')
      .replace(/tw`.*`/g, '{}');

    return tsJestTransformer.process(
      procesedSrc,
      filename,
      jestConfig,
      ...rest
    );
  },
};
