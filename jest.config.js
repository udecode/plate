module.exports = {
  collectCoverageFrom: [
    'packages/*/src/**/*',
    '!**/index.ts*',
    '!**/*test*/**',
    '!**/*fixture*/**',
    '!**/*template*/**',
    '!**/*stories*',
    '!**/*.development.*',
  ],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.test.json',
    },
  },
  moduleDirectories: ['node_modules'],
  moduleFileExtensions: ['js', 'json', 'ts', 'tsx'],
  moduleNameMapper: {
    '\\.(css|less|sass|scss)$': '<rootDir>/scripts/styleMock.js',
  },
  testEnvironment: 'jsdom',
  testRegex: '(test|spec).tsx?$',
  transform: {
    '.*': ['<rootDir>/scripts/fileTransformer.js', 'ts-jest'],
  },
  setupFilesAfterEnv: ['<rootDir>/scripts/setupTests.ts'],
};
