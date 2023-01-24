# @udecode/plate-indent

## 19.1.0

## 19.0.3

## 19.0.1

## 19.0.0

## 18.15.0

## 18.13.0

## 18.9.0

## 18.7.0

## 18.6.0

## 18.3.0

### Patch Changes

- [#1931](https://github.com/udecode/plate/pull/1931) by [@zbeyens](https://github.com/zbeyens) – Fix: `toggleIndentList` should indent only the lowest block (nested case).

## 18.2.0

## 18.1.1

## 17.0.3

## 17.0.2

## 17.0.1

## 17.0.0

## 16.8.0

## 16.7.0

### Minor Changes

- [#1850](https://github.com/udecode/plate/pull/1850) by [@bokuweb](https://github.com/bokuweb) – New prop: `listRestart` - if set, force `listStart` to be `listRestart` instead of the previous `listStart + 1`

## 16.5.0

## 16.3.0

## 16.2.0

## 16.1.0

## 16.0.2

## 16.0.0

## 15.0.3

## 15.0.0

## 14.4.2

## 14.0.2

## 14.0.0

## 13.8.0

## 13.7.0

## 13.6.0

## 13.5.0

## 13.1.0

## 11.2.1

## 11.2.0

### Minor Changes

- [#1560](https://github.com/udecode/plate/pull/1560) by [@zbeyens](https://github.com/zbeyens) –
  - fix: tab / untab when composing with IME
  - update peerDeps:
    - `"slate": ">=0.78.0"`
    - `"slate-react": ">=0.79.0"`

## 11.1.0

## 11.0.6

## 11.0.5

## 11.0.4

## 11.0.3

## 11.0.2

## 11.0.1

## 11.0.0

## 10.5.3

## 10.5.2

## 10.5.0

## 10.4.2

## 10.4.1

## 10.4.0

## 10.2.2

## 10.2.1

## 10.1.2

## 10.1.1

### Patch Changes

- [#1388](https://github.com/udecode/plate/pull/1388) by [@zbeyens](https://github.com/zbeyens) – fix for docs only: use `Array.from` instead of destructuring generators

## 10.1.0

## 10.0.0

## 9.4.0

### Minor Changes

- [#1373](https://github.com/udecode/plate/pull/1373) by [@zbeyens](https://github.com/zbeyens) – Docx deserializer supports more indent list styles: DecimalLeadingZero, LowerRoman, UpperRoman, UpperAlpha

## 9.3.1

## 9.3.0

### Minor Changes

- [#1364](https://github.com/udecode/plate/pull/1364) by [@zbeyens](https://github.com/zbeyens) – Feat: new textIndent plugin + docx deserializer support

## 9.2.1

## 9.2.0

## 9.0.0

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
