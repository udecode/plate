---
'@udecode/plate-core': minor
---

- Default editor value is now overridable with `editor.childrenFactory()`
- New core plugin `nodeFactory`, extends the editor with:
  - `blockFactory: (node) => TElement`, can be used to create the default editor block
  - `childrenFactory: () => Value`
- New transform `resetEditorChildren`: Replace editor children by `editor.childrenFactory()`.