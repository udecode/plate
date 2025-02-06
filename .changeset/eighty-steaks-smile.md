---
'@udecode/plate-table': major
---

Move store state `selectedCells` and `selectedTables` from `useTableStore` to `TablePlugin` options store. This fixes the issue to get access to those state outside a table element (e.g. the toolbar)
