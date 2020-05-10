const jestConfig = require('../../jest.config');

module.exports = {
  ...jestConfig,
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
};
