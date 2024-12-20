---
'@udecode/plate-core': patch
---

- Add `useNodePath(node: TNode)`: memoized `findPath` (`useMemo`)
- Add `usePath(pluginKey?: string)`: memoized `findPath` (context)
- `PlateElementProps` now includes `path` prop, also accessible using `usePath`
