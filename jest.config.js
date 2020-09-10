module.exports = {
  collectCoverageFrom: [
    'packages/*/src/**/*',
    '!**/index.ts',
    '!**/*test*/**',
    '!**/*fixture*/**',
    '!**/*template*/**',
    '!**/*stories*',
    '!**/*.development.*',
  ],
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.test.json',
    },
  },
  moduleDirectories: ['node_modules'],
  moduleFileExtensions: ['js', 'json', 'ts', 'tsx'],
  moduleNameMapper: {
    '@udecode/slate-plugins$': '<rootDir>packages/slate-plugins/src'
  },
  testEnvironment: 'jsdom',
  testRegex: '(test|spec).tsx?$',
  transform: {
    '^.+\\.(t|j)sx?$': 'ts-jest',
  },
  setupFiles: ["core-js"],
  setupFilesAfterEnv: ['<rootDir>/scripts/setupTests.ts'],
};
