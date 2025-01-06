---
'@udecode/slate': major
---

- Rename `createEditor` to `createEditor`.
- `createEditor` (`Editor`) now overrides all methods with this package methods. For example, `editor.setNodes` is now using `setNodes` from this package instead of `slate` one. As a reminder, this package forked most `slate`, `slate-dom` and `slate-history` queries/transforms to enhance the types, add options and suppress throwing errors. The following interfaces from `slate` are overridden:
  - `Editor`, `EditorInterface`
  - `Transforms`
  - `HistoryEditor` (noop, unchanged), `HistoryEditorInterface`
  - `DOMEditor` (noop, unchanged), `DOMEditorInterface`
- `editor.findPath` now returns `DOMEditor.findPath` (memo) and falls back to `findNodePath` (traversal method, less performant) if not found. We now **recommend to always use** `editor.findPath` over `findNodePath` / `findPath`.
- Remove first parameter (`editor`) from:
  - `editor.hasEditableTarget`,
  - `editor.hasSelectableTarget`,
  - `editor.isTargetInsideNonReadonlyVoid`,
  - `editor.hasRange`,
  - `editor.hasTarget`,
- Remove `setNode` in favor of `setNodes`. `at` option can now be a `TNode` so you don't need to use `at: editor.findPath(node)`.
- Remove `setElements` in favor of `setNodes`.

Types:

- Rename `TEditor` to `Editor`. Make sure to not import `slate` one.
- Query and transform options now use generic `V extends Value` instead of `E extends Editor`.
- `getEndPoint`, `getEdgePoints`, `getFirstNode`, `getFragment`, `getLastNode`, `getLeafNode`, `getPath`, `getPoint`, `getStartPoint` can return `undefined` if not found
- Replace `NodeOf` type with `DescendantOf` in `editor.tf.setNodes` `editor.tf.unsetNodes`, `editor.api.previous`, `editor.api.node`, `editor.api.nodes`, `editor.api.last`
