---
'@udecode/slate': patch
---

- `TEditor`: add `findPath` – Find the path of a node. Default is `findNodePath` (traversal). Overridden by `withPlate` to use `ReactEditor.findPath` (memo). We now **recommend to always use** `editor.findPath` over `findNodePath` / `findPath`.
