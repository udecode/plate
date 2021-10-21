---
'@udecode/plate-table-ui': minor
---

Added support for resizing columns:
- styles
- `TableCellElement` component:
  - Show a blue vertical line when hovering between columns
  - Use of jotai to share resizing width, hovering column
- `useTableColSizes` hook
- `hoveredColIndexAtom`, `resizingColAtom` atoms
- Support undo/redo
- deps: `jotai` and `re-resizable`


