---
"@udecode/plate-core": minor
---

- New core plugin: `editorProtocol` following https://github.com/udecode/editor-protocol core specs
  - Fixes https://github.com/udecode/editor-protocol/issues/81
- Slate types: replaced editor mark types by `string`. Derived types from `EMarks<V>` are often unusable.
