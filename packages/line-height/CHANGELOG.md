# @udecode/plate-line-height

## 29.0.1

## 29.0.0

## 28.0.0

### Patch Changes

- [#2816](https://github.com/udecode/plate/pull/2816) by [@12joan](https://github.com/12joan) –
  - Replace `useEdtiorState` with `useEditorSelector`

## 27.0.3

## 27.0.0

## 25.0.1

## 25.0.0

## 24.5.2

## 24.4.0

### Minor Changes

- [#2675](https://github.com/udecode/plate/pull/2675) by [@zbeyens](https://github.com/zbeyens) – Support slate-react 0.99.0

## 24.3.6

## 24.3.5

## 24.3.2

## 24.3.1

## 24.3.0

## 24.2.0

## 24.0.2

## 24.0.1

## 24.0.0

## 23.7.4

## 23.7.2

### Patch Changes

- [#2618](https://github.com/udecode/plate/pull/2618) by [@zbeyens](https://github.com/zbeyens) – `useLineHeightDropdownMenuState`:
  - fix: get line height from the block above instead of the top one.
  - fix: return undefined if the selection is expanded as selection may contain blocks with multiple line height values.

## 23.7.0

## 23.6.0

## 23.3.1

## 23.3.0

## 22.0.2

## 22.0.1

## 22.0.0

## 21.5.0

## 21.4.2

## 21.4.1

## 21.3.2

## 21.3.0

## 21.1.5

## 21.0.0

## 20.7.2

## 20.7.0

## 20.4.0

## 20.3.2

## 20.0.0

## 19.7.0

## 19.5.0

## 19.4.4

## 19.4.2

## 19.2.0

## 19.1.1

## 19.1.0

## 19.0.3

## 19.0.1

## 19.0.0

## 18.15.0

## 18.13.0

## 18.9.0

## 18.7.0

## 18.6.0

## 18.2.0

## 18.1.1

## 17.0.3

## 17.0.2

## 17.0.1

## 17.0.0

## 16.8.0

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

## 10.1.0

## 10.0.0

## 9.3.1

## 9.3.0

## 9.2.1

## 9.2.0

## 9.0.0

### Minor Changes

- [#1303](https://github.com/udecode/plate/pull/1303) by [@zbeyens](https://github.com/zbeyens) –
  - inject `deserializeHtml.getNode` to set `lineHeight` if `el.style.lineHeight` is defined

## 8.3.0

### Minor Changes

- [#1266](https://github.com/udecode/plate/pull/1266) by [@zbeyens](https://github.com/zbeyens) –
  - remove default `validNodeValues`

## 8.1.0

## 8.0.0

## 7.0.2

## 7.0.1

## 7.0.0

### Major Changes

- [#1190](https://github.com/udecode/plate/pull/1190) by [@zbeyens](https://github.com/zbeyens) –
  - `setLineHeight`: option `lineHeight` renamed to `value`
  - removed `getLineHeightOverrideProps` in favor of `getOverrideProps(KEY_LINE_HEIGHT)`

## 6.4.1

## 6.4.0

### Minor Changes

- [#1176](https://github.com/udecode/plate/pull/1176) by [@ghingis](https://github.com/ghingis) – new packages: `line-height` and `line-height-ui`

### Patch Changes

- [#1184](https://github.com/udecode/plate/pull/1184) by [@ghingis](https://github.com/ghingis) – now uses `getElementOverrideProps` / `getLeafOverrideProps`
