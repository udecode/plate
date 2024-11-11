---
'@udecode/plate-node-id': minor
---

- `idCreator` default is now `nanoid(10)`
- New option `filterInline` to filter inline elements. Default is `true`.
- `NodeIdPlugin`:
  - add `normalizeInitialValue` that set node ids when missing, called before mount
  - default behavior will normalize only the first and last node are missing id to avoid traversing the entire document
  - you can disable it with `NodeIdPlugin.configure({ normalizeInitialValue: null })`
  - you can force check all nodes with `NodeIdPlugin.configure({ options: { normalizeInitialValue: true } })`
