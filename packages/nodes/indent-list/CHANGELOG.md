# @udecode/plate-indent-list

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
