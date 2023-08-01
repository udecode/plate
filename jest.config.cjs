const { pathsToModuleNameMapper } = require('ts-jest');
const appRoot = require('app-root-path');

const packageJson = require(`${process.cwd()}/package.json`);
const packageName = packageJson.name ?? 'plate';
const { compilerOptions: baseTsConfig } = require(`${appRoot}/tsconfig.json`);

// Take the paths from tsconfig automatically from base tsconfig.json
// @link https://kulshekhar.github.io/ts-jest/docs/paths-mapping
const getTsConfigBasePaths = () => {
  return baseTsConfig.paths
    ? pathsToModuleNameMapper(baseTsConfig.paths, {
        prefix: '<rootDir>/',
      })
    : {};
};

const aliases = require(`${appRoot}/config/aliases`);

const modules = {};

Object.keys(aliases).forEach((key) => {
  const value = aliases[key];

  modules[`^${key}$`] = `<rootDir>/packages/${value}/src`;
});

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  displayName: packageName,
  collectCoverageFrom: [
    'packages/**/src/**/*.{ts,tsx}',
    '!**/*.styles.ts*',
    '!**/index.ts*',
    '!**/*test*/**',
    '!**/*fixture*/**',
    '!**/*template*/**',
    '!**/*stories*',
    '!**/*.development.*',
  ],
  moduleDirectories: ['node_modules'],
  moduleFileExtensions: ['js', 'json', 'ts', 'tsx'],
  moduleNameMapper: {
    '\\.(css|less|sass|scss)$': '<rootDir>/scripts/styleMock.cjs',
    ...getTsConfigBasePaths(),
    // '^@udecode/plate-core$': '<rootDir>/packages/core/src',
    ...modules,
  },
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testRegex: '(test|spec).tsx?$',
  testPathIgnorePatterns: ['/playwright/'],
  transform: {
    "^.+\\.[tj]s$": [
      'ts-jest',
      {
        diagnostics: true,
        tsconfig: '<rootDir>/config/tsconfig.test.json',
      },
    ],
  },
  setupFilesAfterEnv: ['<rootDir>/scripts/setupTests.ts'],
  transformIgnorePatterns: [
    '/node_modules/(?!(react-dnd|dnd-core|@react-dnd|react-tweet)/)',
  ],
};
