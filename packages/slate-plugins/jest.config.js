const jestConfig = require('../../jest.config');

module.exports = {
  ...jestConfig,
  rootDir: 'src',
  setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
};
