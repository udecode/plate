---
'@udecode/plate-table': minor
---

- Make rows resizable in addition to columns
  - `TableCellElement.ResizableWrapper` no longer takes a `colIndex` prop
  - `TableCellElement.Resizable` now takes `stepX` and `stepY` as overrides for `step` to set the resize increments for the X and Y axes
  - `setTableRowSize` - sets the height of the selected row
