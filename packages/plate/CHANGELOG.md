# @udecode/plate

## 47.2.3

## 47.1.1

## 46.0.10

## 46.0.9

## 46.0.4

## 46.0.2

## 45.0.9

## 45.0.8

## 45.0.7

## 45.0.6

## 45.0.5

## 45.0.2

## 45.0.1

## 44.0.7

## 44.0.1

## 44.0.0

## 43.0.5

## 43.0.4

## 43.0.2

## 43.0.0

## 42.2.5

## 42.2.2

## 42.1.2

## 42.1.1

## 42.0.6

## 42.0.5

## 42.0.4

## 42.0.3

## 42.0.1

## 42.0.0

### Major Changes

- [#3920](https://github.com/udecode/plate/pull/3920) by [@zbeyens](https://github.com/zbeyens) – **This package is now the new common package**, so all plugin packages are being removed. **Migration**:

  - Add the following dependencies:

  ```json
  "@udecode/plate-alignment": "42.0.0",
  "@udecode/plate-autoformat": "42.0.0",
  "@udecode/plate-basic-elements": "42.0.0",
  "@udecode/plate-basic-marks": "42.0.0",
  "@udecode/plate-block-quote": "42.0.0",
  "@udecode/plate-break": "42.0.0",
  "@udecode/plate-code-block": "42.0.0",
  "@udecode/plate-combobox": "42.0.0",
  "@udecode/plate-comments": "42.0.0",
  "@udecode/plate-csv": "42.0.0",
  "@udecode/plate-diff": "42.0.0",
  "@udecode/plate-docx": "42.0.0",
  "@udecode/plate-find-replace": "42.0.0",
  "@udecode/plate-floating": "42.0.0",
  "@udecode/plate-font": "42.0.0",
  "@udecode/plate-heading": "42.0.0",
  "@udecode/plate-highlight": "42.0.0",
  "@udecode/plate-horizontal-rule": "42.0.0",
  "@udecode/plate-indent": "42.0.0",
  "@udecode/plate-indent-list": "42.0.0",
  "@udecode/plate-kbd": "42.0.0",
  "@udecode/plate-layout": "42.0.0",
  "@udecode/plate-line-height": "42.0.0",
  "@udecode/plate-link": "42.0.0",
  "@udecode/plate-list": "42.0.0",
  "@udecode/plate-markdown": "42.0.0",
  "@udecode/plate-media": "42.0.0",
  "@udecode/plate-mention": "42.0.0",
  "@udecode/plate-node-id": "42.0.0",
  "@udecode/plate-normalizers": "42.0.0",
  "@udecode/plate-reset-node": "42.0.0",
  "@udecode/plate-resizable": "42.0.0",
  "@udecode/plate-select": "42.0.0",
  "@udecode/plate-selection": "42.0.0",
  "@udecode/plate-slash-command": "42.0.0",
  "@udecode/plate-suggestion": "42.0.0",
  "@udecode/plate-tabbable": "42.0.0",
  "@udecode/plate-table": "42.0.0",
  "@udecode/plate-toggle": "42.0.0",
  "@udecode/plate-trailing-block": "42.0.0"
  ```

  - Either replace all `@udecode/plate` imports with the individual package imports, or export the following in a new file (e.g. `src/plate.ts`):

  ```ts
  export * from '@udecode/plate-alignment';
  export * from '@udecode/plate-autoformat';
  export * from '@udecode/plate-basic-elements';
  export * from '@udecode/plate-basic-marks';
  export * from '@udecode/plate-block-quote';
  export * from '@udecode/plate-break';
  export * from '@udecode/plate-code-block';
  export * from '@udecode/plate-combobox';
  export * from '@udecode/plate-comments';
  export * from '@udecode/plate-diff';
  export * from '@udecode/plate-find-replace';
  export * from '@udecode/plate-font';
  export * from '@udecode/plate-heading';
  export * from '@udecode/plate-highlight';
  export * from '@udecode/plate-horizontal-rule';
  export * from '@udecode/plate-indent';
  export * from '@udecode/plate-indent-list';
  export * from '@udecode/plate-kbd';
  export * from '@udecode/plate-layout';
  export * from '@udecode/plate-line-height';
  export * from '@udecode/plate-link';
  export * from '@udecode/plate-list';
  export * from '@udecode/plate-media';
  export * from '@udecode/plate-mention';
  export * from '@udecode/plate-node-id';
  export * from '@udecode/plate-normalizers';
  export * from '@udecode/plate-reset-node';
  export * from '@udecode/plate-select';
  export * from '@udecode/plate-csv';
  export * from '@udecode/plate-docx';
  export * from '@udecode/plate-markdown';
  export * from '@udecode/plate-slash-command';
  export * from '@udecode/plate-suggestion';
  export * from '@udecode/plate-tabbable';
  export * from '@udecode/plate-table';
  export * from '@udecode/plate-toggle';
  export * from '@udecode/plate-trailing-block';
  export * from '@udecode/plate-alignment/react';
  export * from '@udecode/plate-autoformat/react';
  export * from '@udecode/plate-basic-elements/react';
  export * from '@udecode/plate-basic-marks/react';
  export * from '@udecode/plate-block-quote/react';
  export * from '@udecode/plate-break/react';
  export * from '@udecode/plate-code-block/react';
  export * from '@udecode/plate-combobox/react';
  export * from '@udecode/plate-comments/react';
  export * from '@udecode/plate-floating';
  export * from '@udecode/plate-font/react';
  export * from '@udecode/plate-heading/react';
  export * from '@udecode/plate-highlight/react';
  export * from '@udecode/plate-layout/react';
  export * from '@udecode/plate-slash-command/react';
  export * from '@udecode/plate-indent/react';
  export * from '@udecode/plate-indent-list/react';
  export * from '@udecode/plate-kbd/react';
  export * from '@udecode/plate-line-height/react';
  export * from '@udecode/plate-link/react';
  export * from '@udecode/plate-list/react';
  export * from '@udecode/plate-media/react';
  export * from '@udecode/plate-reset-node/react';
  export * from '@udecode/plate-selection';
  export * from '@udecode/plate-suggestion/react';
  export * from '@udecode/plate-tabbable/react';
  export * from '@udecode/plate-table/react';
  export * from '@udecode/plate-toggle/react';
  export * from '@udecode/plate-resizable';
  ```

  - Replace all `'@udecode/plate'` and `'@udecode/plate/react'` with `'@/plate'` in your codebase.

# @udecode/plate-common (< 42.0.0)

## 42.0.0

### Major Changes

- [#3920](https://github.com/udecode/plate/pull/3920) by [@zbeyens](https://github.com/zbeyens) – This package is now deprecated and will be renamed to `@udecode/plate`. Migration:

  - Remove `@udecode/plate-common` and install `@udecode/plate`
  - Replace all `'@udecode/plate-common'` with `'@udecode/plate'`,

## 37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - Split build into `@udecode/plate-common` and `@udecode/plate-common/react`.
  - NEW `/react` exports `@udecode/react-hotkeys`

## 33.0.4

### Patch Changes

- [#3199](https://github.com/udecode/plate/pull/3199) by [@zbeyens](https://github.com/zbeyens) – Fix `PlateElementProps` type

## 29.0.0

### Minor Changes

- [#2829](https://github.com/udecode/plate/pull/2829) by [@zbeyens](https://github.com/zbeyens) –
  - re-export `@udecode/react-utils`

### Patch Changes

- [#2829](https://github.com/udecode/plate/pull/2829) by [@zbeyens](https://github.com/zbeyens) –
  - Fix import from RSC

## 24.4.0

### Minor Changes

- [#2675](https://github.com/udecode/plate/pull/2675) by [@zbeyens](https://github.com/zbeyens) – Support slate-react 0.99.0
