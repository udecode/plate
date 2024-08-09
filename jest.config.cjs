const { pathsToModuleNameMapper } = require('ts-jest');
const appRoot = require('app-root-path');

const packageJson = require(`${process.cwd()}/package.json`);
const packageName = packageJson.name ?? 'plate';
const { compilerOptions: baseTsConfig } = require(
  `${appRoot}/config/tsconfig.test.json`
);

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

/** @type {import('ts-jest').JestConfigWithTsJest} */
// @ts-check
module.exports = {
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
  coveragePathIgnorePatterns: ['/node_modules/', '\\.d\\.ts$'],
  displayName: packageName,
  moduleDirectories: ['node_modules'],
  moduleFileExtensions: ['js', 'json', 'ts', 'tsx'],
  moduleNameMapper: {
    '\\.(css|less|sass|scss)$': '<rootDir>/scripts/styleMock.cjs',
    ...getTsConfigBasePaths(),
    // '^@udecode/plate-core$': '<rootDir>/packages/core/src',
    ...modules,
  },
  preset: 'ts-jest',
  setupFilesAfterEnv: ['<rootDir>/scripts/setupTests.ts'],
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['/playwright/', '/packages/cli/'],
  testRegex: '(test|spec).tsx?$',
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(react-dnd|dnd-core|@react-dnd|react-dnd-html5-backend|react-tweet)/)',
  ],
  watchman: false,
};
