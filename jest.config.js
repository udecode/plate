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
    // '^@udecode/plate-dnd$': '<rootDir>/packages/dnd/src',
    '^@udecode/plate-common$': '<rootDir>/packages/common/src',
    // '^@udecode/plate-basic-elements$':
    //   '<rootDir>/packages/elements/basic-elements/src',
    // '^@udecode/plate-alignment$': '<rootDir>/packages/elements/alignment/src',
    // '^@udecode/plate-alignment-ui$':
    //   '<rootDir>/packages/elements/alignment-ui/src',
    // '^@udecode/plate-block-quote$':
    //   '<rootDir>/packages/elements/block-quote/src',
    // '^@udecode/plate-block-quote-ui$':
    //   '<rootDir>/packages/elements/block-quote-ui/src',
    // '^@udecode/plate-code-block$': '<rootDir>/packages/elements/code-block/src',
    // '^@udecode/plate-code-block-ui$':
    //   '<rootDir>/packages/elements/code-block-ui/src',
    // '^@udecode/plate-excalidraw$': '<rootDir>/packages/elements/excalidraw/src',
    // '^@udecode/plate-heading$': '<rootDir>/packages/elements/heading/src',
    // '^@udecode/plate-image$': '<rootDir>/packages/elements/image/src',
    // '^@udecode/plate-image-ui$': '<rootDir>/packages/elements/image-ui/src',
    // '^@udecode/plate-link$': '<rootDir>/packages/elements/link/src',
    // '^@udecode/plate-link-ui$': '<rootDir>/packages/elements/link-ui/src',
    // '^@udecode/plate-list$': '<rootDir>/packages/elements/list/src',
    // '^@udecode/plate-list-ui$': '<rootDir>/packages/elements/list-ui/src',
    // '^@udecode/plate-media-embed$':
    //   '<rootDir>/packages/elements/media-embed/src',
    // '^@udecode/plate-media-embed-ui$':
    //   '<rootDir>/packages/elements/media-embed-ui/src',
    // '^@udecode/plate-mention$': '<rootDir>/packages/elements/mention/src',
    // '^@udecode/plate-mention-ui$': '<rootDir>/packages/elements/mention-ui/src',
    // '^@udecode/plate-paragraph$': '<rootDir>/packages/elements/paragraph/src',
    // '^@udecode/plate-placeholder$': '<rootDir>/packages/placeholder/src',
    // '^@udecode/plate-table$': '<rootDir>/packages/elements/table/src',
    // '^@udecode/plate-table-ui$': '<rootDir>/packages/elements/table-ui/src',
    // '^@udecode/plate-basic-marks$': '<rootDir>/packages/marks/basic-marks/src',
    // '^@udecode/plate-font$': '<rootDir>/packages/marks/font/src',
    // '^@udecode/plate-font-ui$': '<rootDir>/packages/marks/font-ui/src',
    // '^@udecode/plate-highlight$': '<rootDir>/packages/marks/highlight/src',
    // '^@udecode/plate-kbd$': '<rootDir>/packages/marks/kbd/src',
    // '^@udecode/plate-html-serializer$':
    //   '<rootDir>/packages/serializers/html/src',
    // '^@udecode/plate-md-serializer$':
    //   '<rootDir>/packages/serializers/md/src',
    // '^@udecode/plate-ast-serializer$':
    //   '<rootDir>/packages/serializers/ast/src',
    // '^@udecode/plate-autoformat$': '<rootDir>/packages/autoformat/src',
    // '^@udecode/plate-break$': '<rootDir>/packages/break/src',
    // '^@udecode/plate-find-replace$': '<rootDir>/packages/find-replace/src',
    // '^@udecode/plate-find-replace-ui$': '<rootDir>/packages/find-replace-ui/src',
    // '^@udecode/plate-node-id$': '<rootDir>/packages/node-id/src',
    // '^@udecode/plate-normalizers$': '<rootDir>/packages/normalizers/src',
    // '^@udecode/plate-reset-node$': '<rootDir>/packages/reset-node/src',
    // '^@udecode/plate-select$': '<rootDir>/packages/select/src',
    // '^@udecode/plate-styled-components$':
    //   '<rootDir>/packages/ui/styled-components/src',
    // '^@udecode/plate-trailing-block$': '<rootDir>/packages/trailing-block/src',
    // '^@udecode/plate-toolbar$': '<rootDir>/packages/ui/toolbar/src',
  },
  testEnvironment: 'jsdom',
  testRegex: '(test|spec).tsx?$',
  transform: {
    '.*': ['<rootDir>/scripts/fileTransformer.js', 'ts-jest'],
  },
  setupFilesAfterEnv: ['<rootDir>/scripts/setupTests.ts'],
};
