# @udecode/plate-indent-list

## 21.0.0

## 20.7.2

## 20.7.0

## 20.4.0

## 20.3.2

### Patch Changes

- [#2285](https://github.com/udecode/plate/pull/2285) by [@12joan](https://github.com/12joan) – Ignore `defaultPrevented` keydown events

## 20.0.0

## 19.7.0

## 19.5.0

## 19.4.4

## 19.4.2

## 19.4.1

## 19.2.0

## 19.1.1

## 19.1.0

## 19.0.3

## 19.0.1

## 19.0.0

## 18.15.0

## 18.13.0

## 18.9.2

## 18.9.0

## 18.7.0

### Minor Changes

- [#1960](https://github.com/udecode/plate/pull/1960) by [@zbeyens](https://github.com/zbeyens) –
  - Now supports pasting google docs lists
  - New option: `getListStyleType`: Map html element to list style type.

## 18.6.0

### Minor Changes

- [#1959](https://github.com/udecode/plate/pull/1959) by [@zbeyens](https://github.com/zbeyens) –
  - Now supports pasting google docs lists
  - New option: `getListStyleType`: Map html element to list style type.

## 18.3.0

### Minor Changes

- [#1931](https://github.com/udecode/plate/pull/1931) by [@zbeyens](https://github.com/zbeyens) – Handle `Enter` key to outdent if empty.

## 18.2.0

## 18.1.3

### Patch Changes

- [#1918](https://github.com/udecode/plate/pull/1918) by [@zbeyens](https://github.com/zbeyens) – Fix indent 0

## 18.1.2

### Patch Changes

- [#1915](https://github.com/udecode/plate/pull/1915) by [@zbeyens](https://github.com/zbeyens) – fix: support indent 0

## 18.1.1

## 17.0.3

## 17.0.2

## 17.0.1

## 17.0.0

## 16.8.0

## 16.7.0

### Minor Changes

- [#1850](https://github.com/udecode/plate/pull/1850) by [@bokuweb](https://github.com/bokuweb) – New prop: `listRestart` - if set, force `listStart` to be `listRestart` instead of the previous `listStart + 1`

## 16.6.1

## 16.5.0

## 16.4.2

## 16.4.1

## 16.3.0

## 16.2.0

## 16.1.0

## 16.0.2

## 16.0.0

## 15.0.6

## 15.0.3

## 15.0.0

## 14.4.3

## 14.4.2

## 14.4.0

## 14.1.0

## 14.0.2

## 14.0.0

## 13.8.0

## 13.7.0

## 13.6.0

## 13.5.0

## 13.3.1

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

## 10.5.1

### Patch Changes

- [#1467](https://github.com/udecode/plate/pull/1467) by [@zbeyens](https://github.com/zbeyens) –
  - fix indent `listStart` normalization
  - fix `toggleIndentList`
  - fix normalization on `merge_node` and `set_node` ops

## 10.5.0

### Minor Changes

- [#1465](https://github.com/udecode/plate/pull/1465) by [@zbeyens](https://github.com/zbeyens) –
  - indent-list plugin:
    - new option: `getSiblingIndentListOptions` which is used by normalizers to get list siblings (e.g. for `listStart`).
    - normalizer handling a few more cases

## 10.4.2

## 10.4.1

## 10.4.0

## 10.2.2

## 10.2.1

## 10.1.2

## 10.1.1

## 10.1.0

## 10.0.0

## 9.4.0

### Minor Changes

- [#1373](https://github.com/udecode/plate/pull/1373) by [@zbeyens](https://github.com/zbeyens) – Docx deserializer supports more indent list styles: DecimalLeadingZero, LowerRoman, UpperRoman, UpperAlpha

## 9.3.1

## 9.3.0

## 9.2.1

## 9.2.0

## 9.0.0

## 8.3.0

## 8.1.0

## 8.0.0

### Major Changes

- [#1234](https://github.com/udecode/plate/pull/1234) by [@zbeyens](https://github.com/zbeyens) – Removed:

  - `IndentListPluginOptions` for `PlatePlugin`

  Rename:

  - `getIndentListInjectComponent` to `injectIndentListComponent`

## 7.0.2

## 7.0.1

## 7.0.0

### Minor Changes

- [#1190](https://github.com/udecode/plate/pull/1190) by [@zbeyens](https://github.com/zbeyens) – new package: `@udecode/plate-indent-list`
