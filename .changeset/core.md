---
'@udecode/plate-core': patch
---

- `withPlate` overrides `editor.findPath` with `ReactEditor.findPath` (memo). We now **recommend to always use** `editor.findPath` over `findNodePath` / `findPath`.
