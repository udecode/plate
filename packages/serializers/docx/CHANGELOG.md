# @udecode/plate-docx-serializer

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
