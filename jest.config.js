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

console.log(`${process.cwd()}/package.json`);

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
    // '^@udecode/plate-ui-dnd$': '<rootDir>/packages/dnd/src',
    '^@udecode/plate-core$': '<rootDir>/packages/core/src',
    // '^@udecode/plate-basic-elements$':
    //   '<rootDir>/packages/nodes/basic-elements/src',
    // '^@udecode/plate-alignment$': '<rootDir>/packages/nodes/alignment/src',
    // '^@udecode/plate-ui-alignment$':
    //   '<rootDir>/packages/nodes/alignment-ui/src',
    // '^@udecode/plate-block-quote$':
    //   '<rootDir>/packages/nodes/block-quote/src',
    // '^@udecode/plate-ui-block-quote$':
    //   '<rootDir>/packages/ui/nodes/block-quote/src',
    // '^@udecode/plate-code-block$': '<rootDir>/packages/nodes/code-block/src',
    // '^@udecode/plate-ui-code-block$':
    //   '<rootDir>/packages/ui/nodes/code-block/src',
    // '^@udecode/plate-excalidraw$': '<rootDir>/packages/ui/nodes/excalidraw/src',
    // '^@udecode/plate-heading$': '<rootDir>/packages/nodes/heading/src',
    // '^@udecode/plate-image$': '<rootDir>/packages/nodes/image/src',
    // '^@udecode/plate-ui-image$': '<rootDir>/packages/ui/nodes/image/src',
    // '^@udecode/plate-link$': '<rootDir>/packages/nodes/link/src',
    // '^@udecode/plate-ui-link$': '<rootDir>/packages/ui/nodes/link/src',
    // '^@udecode/plate-list$': '<rootDir>/packages/nodes/list/src',
    // '^@udecode/plate-ui-list$': '<rootDir>/packages/ui/nodes/list/src',
    // '^@udecode/plate-media-embed$':
    //   '<rootDir>/packages/nodes/media-embed/src',
    // '^@udecode/plate-ui-media-embed$':
    //   '<rootDir>/packages/ui/nodes/media-embed/src',
    // '^@udecode/plate-mention$': '<rootDir>/packages/nodes/mention/src',
    // '^@udecode/plate-ui-mention$': '<rootDir>/packages/ui/nodes/mention/src',
    // '^@udecode/plate-paragraph$': '<rootDir>/packages/nodes/paragraph/src',
    // '^@udecode/plate-ui-placeholder$': '<rootDir>/packages/placeholder/src',
    // '^@udecode/plate-table$': '<rootDir>/packages/nodes/table/src',
    // '^@udecode/plate-ui-table$': '<rootDir>/packages/ui/nodes/table/src',
    // '^@udecode/plate-basic-marks$': '<rootDir>/packages/nodes/basic-marks/src',
    // '^@udecode/plate-font$': '<rootDir>/packages/nodes/font/src',
    // '^@udecode/plate-ui-font$': '<rootDir>/packages/ui/nodes/font/src',
    // '^@udecode/plate-highlight$': '<rootDir>/packages/nodes/highlight/src',
    // '^@udecode/plate-kbd$': '<rootDir>/packages/nodes/kbd/src',
    // '^@udecode/plate-serializer-md$':
    //   '<rootDir>/packages/serializers/md/src',
    // '^@udecode/plate-autoformat$': '<rootDir>/packages/autoformat/src',
    // '^@udecode/plate-break$': '<rootDir>/packages/break/src',
    // '^@udecode/plate-find-replace$': '<rootDir>/packages/find-replace/src',
    // '^@udecode/plate-ui-find-replace$': '<rootDir>/packages/ui/find-replace/src',
    // '^@udecode/plate-node-id$': '<rootDir>/packages/node-id/src',
    // '^@udecode/plate-normalizers$': '<rootDir>/packages/normalizers/src',
    // '^@udecode/plate-reset-node$': '<rootDir>/packages/reset-node/src',
    // '^@udecode/plate-select$': '<rootDir>/packages/select/src',
    // '^@udecode/plate-styled-components$':
    //   '<rootDir>/packages/ui/styled-components/src',
    // '^@udecode/plate-trailing-block$': '<rootDir>/packages/trailing-block/src',
    // '^@udecode/plate-ui-toolbar$': '<rootDir>/packages/ui/toolbar/src',
  },
  testEnvironment: 'jsdom',
  testRegex: '(test|spec).tsx?$',
  transform: {
    '.*': ['<rootDir>/scripts/fileTransformer.js', 'ts-jest'],
  },
  transformIgnorePatterns: ['/node_modules/(?!react-dnd|dnd-core|@react-dnd)'],
  setupFilesAfterEnv: ['<rootDir>/scripts/setupTests.ts'],
};
