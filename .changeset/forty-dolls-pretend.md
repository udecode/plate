---
'@udecode/plate-table-ui': minor
---

Support for resizing columns:
- New deps: `jotai` and `re-resizable`
- New styles
- New component: `TableCellElement`
- New hook: `useTableColSizes`
- New table node field: colSizes?: number[]
- Show a blue vertical line when hovering between columns
- Use of jotai to share resizing width, hovering column
- Support undo/redo
