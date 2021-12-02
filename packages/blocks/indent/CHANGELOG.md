# @udecode/plate-indent

## 8.3.0

## 8.1.0

## 8.0.0

## 7.0.2

## 7.0.1

## 7.0.0

### Major Changes

- [#1190](https://github.com/udecode/plate/pull/1190) by [@zbeyens](https://github.com/zbeyens) –
  - removed `getIndentOverrideProps()` in favor of `getOverrideProps(KEY_INDENT)`
  - rename `onKeyDownHandler` to `getIndentOnKeyDown()`
  - `IndentPluginOptions`
    - rename `types` to `validTypes`
    - rename `cssPropName` to `styleKey`
    - rename `transformCssValue` to `transformNodeValue`

### Minor Changes

- [#1190](https://github.com/udecode/plate/pull/1190) by [@zbeyens](https://github.com/zbeyens) –
  - `setIndent` new options: `SetIndentOptions`

## 6.4.1

## 6.4.0

### Minor Changes

- [#1184](https://github.com/udecode/plate/pull/1184) by [@ghingis](https://github.com/ghingis) – `classNames` plugin option now fits `getElementOverrideProps` API:

  ```ts
  // before
  {
    classNames: [
      'slate-indent-1',
      'slate-indent-2',
      'slate-indent-3',
    ],
  }
  // after
  {
    classNames: {
      1: 'slate-indent-1',
      2: 'slate-indent-2',
      3: 'slate-indent-3',
    },
  }
  ```

### Patch Changes

- [#1184](https://github.com/udecode/plate/pull/1184) by [@ghingis](https://github.com/ghingis) – now uses `getElementOverrideProps` / `getLeafOverrideProps`

- [#1183](https://github.com/udecode/plate/pull/1183) by [@zbeyens](https://github.com/zbeyens) – fix import

## 6.3.0

## 6.2.0

### Minor Changes

- [#1163](https://github.com/udecode/plate/pull/1163) by [@ghingis](https://github.com/ghingis) – feat: keyboard support to indent / outdent (Tab / Shift+Tab)

## 6.1.0

## 6.0.0

## 5.3.5

### Patch Changes

- Updated dependencies [[`a6bf8c5e`](https://github.com/udecode/plate/commit/a6bf8c5e6897c6ab443e0ac3d69a30befeaddadf)]:
  - @udecode/plate-common@5.3.5

## 5.3.1

### Patch Changes

- [#1137](https://github.com/udecode/plate/pull/1137) [`2c50679e`](https://github.com/udecode/plate/commit/2c50679efb5f9dfdfae0a7b34ab77d2d7120ad6a) Thanks [@zbeyens](https://github.com/zbeyens)! - `setIndent` uses `Array.from(x)` instead of `[...x]`

- Updated dependencies [[`8aec270f`](https://github.com/udecode/plate/commit/8aec270f8b06a3b25b8d7144c2e23b0dc12de118)]:
  - @udecode/plate-core@5.3.1
  - @udecode/plate-common@5.3.1

## 5.3.0

### Minor Changes

- [#1126](https://github.com/udecode/plate/pull/1126) [`7ee21356`](https://github.com/udecode/plate/commit/7ee21356f0a4e67e367232b3dbc9957254a0c11e) Thanks [@zbeyens](https://github.com/zbeyens)! - new package

### Patch Changes

- Updated dependencies [[`7ee21356`](https://github.com/udecode/plate/commit/7ee21356f0a4e67e367232b3dbc9957254a0c11e)]:
  - @udecode/plate-core@5.3.0
  - @udecode/plate-common@5.3.0
