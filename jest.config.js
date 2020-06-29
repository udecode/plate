module.exports = {
  collectCoverageFrom: [
    'packages/*/src/**/*',
    '!**/*test*/**',
    '!**/*fixture*/**',
    '!**/*template*/**',
    '!**/*stories*',
    '!**/*.development.*',
  ],
  moduleDirectories: ['node_modules', 'src'],
  moduleFileExtensions: ['js', 'json', 'ts', 'tsx'],
  rootDir: '.',
  testEnvironment: 'jsdom',
  testRegex: '(test|spec).tsx?$',
  transform: {
    '^.+\\.(t|j)sx?$': 'ts-jest',
  },
  setupFilesAfterEnv: ['<rootDir>/scripts/setupTests.ts'],
};
