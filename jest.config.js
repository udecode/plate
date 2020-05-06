module.exports = {
  moduleDirectories: ['node_modules', 'src'],
  moduleFileExtensions: ['js', 'json', 'ts', 'tsx'],
  rootDir: 'packages/slate-deserializers/src',
  testEnvironment: 'jest-environment-jsdom-sixteen',
  testRegex: '(test|spec).tsx?$',
  transform: {
    '^.+\\.(t|j)sx?$': 'ts-jest',
  },
};
