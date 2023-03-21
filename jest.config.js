const { pathsToModuleNameMapper } = require('ts-jest');
const appRoot = require('app-root-path');

const { getJestCachePath } = require(`${appRoot}/config/cache.config`);

const packageJson = require(`${process.cwd()}/package.json`);
const packageName = packageJson.name ?? 'plate';
const {
  compilerOptions: baseTsConfig,
} = require(`${process.cwd()}/tsconfig.json`);

// Take the paths from tsconfig automatically from base tsconfig.json
// @link https://kulshekhar.github.io/ts-jest/docs/paths-mapping
const getTsConfigBasePaths = () => {
  return baseTsConfig.paths
    ? pathsToModuleNameMapper(baseTsConfig.paths, {
        prefix: '<rootDir>/',
      })
    : {};
};

const aliases = require(`${appRoot}/config/aliases-plate`);

const modules = {};

Object.keys(aliases).forEach((key) => {
  const value = aliases[key];

  modules[`^${key}$`] = `<rootDir>/packages/${value}/src`;
});

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  displayName: packageName,
  cacheDirectory: getJestCachePath(packageName),
  // TODO
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
  globals: {
    'ts-jest': {
      diagnostics: true,
      tsconfig: '<rootDir>/config/tsconfig.test.json',
    },
  },
  moduleDirectories: ['node_modules'],
  moduleFileExtensions: ['js', 'json', 'ts', 'tsx'],
  moduleNameMapper: {
    '\\.(css|less|sass|scss)$': '<rootDir>/scripts/styleMock.js',
    ...getTsConfigBasePaths(),
    '^@udecode/plate-core$': '<rootDir>/packages/core/src',
    ...modules,
  },
  testEnvironment: 'jsdom',
  testRegex: '(test|spec).tsx?$',
  testPathIgnorePatterns: ['/playwright/'],
  transform: {
    '.*': ['<rootDir>/scripts/fileTransformer.js', 'ts-jest'],
  },
  transformIgnorePatterns: ['/node_modules/(?!react-dnd|dnd-core|@react-dnd)'],
  setupFilesAfterEnv: ['<rootDir>/scripts/setupTests.ts'],
};
