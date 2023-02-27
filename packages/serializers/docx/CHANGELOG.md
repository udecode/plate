# @udecode/plate-docx-serializer

## 19.7.0

## 19.5.0

## 19.4.4

## 19.4.2

## 19.4.1

## 19.3.0

## 19.2.0

## 19.1.1

## 19.1.0

## 19.0.3

## 19.0.1

## 19.0.0

## 18.15.0

## 18.13.1

## 18.13.0

## 18.11.0

## 18.9.2

## 18.9.0

## 18.7.0

## 18.6.0

## 18.3.0

## 18.2.0

## 18.1.3

## 18.1.2

## 18.1.1

## 17.0.3

## 17.0.2

## 17.0.1

## 17.0.0

## 16.8.0

## 16.7.0

## 16.6.1

## 16.6.0

## 16.5.0

## 16.4.2

## 16.4.1

## 16.3.0

## 16.2.0

## 16.1.0

## 16.0.2

## 16.0.1

## 16.0.0

## 15.0.6

## 15.0.3

## 15.0.0

## 14.4.3

## 14.4.2

## 14.4.0

## 14.2.0

## 14.1.0

## 14.0.2

## 14.0.1

## 14.0.0

## 13.8.0

## 13.7.0

## 13.6.0

## 13.5.0

## 13.3.1

## 13.3.0

## 13.2.1

## 13.1.0

## 11.3.1

## 11.3.0

## 11.2.1

## 11.2.0

## 11.1.1

## 11.1.0

## 11.0.6

## 11.0.5

## 11.0.4

## 11.0.3

## 11.0.2

## 11.0.1

## 11.0.0

### Patch Changes

- [#1500](https://github.com/udecode/plate/pull/1500) by [@zbeyens](https://github.com/zbeyens) – updated deps:
  ```bash
  "validator": "^13.7.0"
  ```

## 10.7.0

## 10.6.3

## 10.5.3

## 10.5.2

## 10.5.1

## 10.5.0

## 10.4.2

## 10.4.1

## 10.4.0

## 10.3.0

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

### Minor Changes

- [#1364](https://github.com/udecode/plate/pull/1364) by [@zbeyens](https://github.com/zbeyens) – Feat: new textIndent plugin + docx deserializer support

## 9.2.1

## 9.2.0

## 9.1.3

## 9.1.1

## 9.1.0

### Minor Changes

- [#1315](https://github.com/udecode/plate/pull/1315) by [@zbeyens](https://github.com/zbeyens) –
  - handle `in` unit for indentation

## 9.0.0

### Minor Changes

- [#1303](https://github.com/udecode/plate/pull/1303) by [@zbeyens](https://github.com/zbeyens) –
  - moved many utils to `@udecode/plate-core`
  - deserialize `textIndent` to indent list
  - changed indent step from `32` to `36`

## 8.3.0

### Minor Changes

- [#1266](https://github.com/udecode/plate/pull/1266) by [@zbeyens](https://github.com/zbeyens) –
  - deserialize line-height in paragraph and headers
  - deserialize tabs
  - deserialize block marks: copy block marks to a new span child
  - fix a juice bug: juice ignores the first class when there is <!-- just after style, so we remove it

## 8.2.1

## 8.2.0

### Minor Changes

- [#1252](https://github.com/udecode/plate/pull/1252) by [@zbeyens](https://github.com/zbeyens) –
  - support text align for p, h1, h2, h3
  - support for list h1, h2, h3

## 8.1.0

### Patch Changes

- [#1249](https://github.com/udecode/plate/pull/1249) by [@zbeyens](https://github.com/zbeyens) – Fix:
  - convert docx `mso-spacerun: yes` to spaces
  - indent was not working with margin left values including a dot, e.g. `10.0pt`
  - docx italic style
  - code block
  - inline code

## 8.0.0
