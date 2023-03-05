---
"@udecode/plate-ui-table": major
---

Headless components and hooks moved to `@udecode/plate-table`, so the following components have been renamed:
- `TableElement` -> `PlateTableElement`
  - removed table border to set it at the cell level
  - `margin-left: 1px` to support cell borders
  - if all columns have a fixed size, the table will have a dynamic width instead of always 100%
- `TableRowElement` -> `PlateTableRowElement`
- `TableCellElement` -> `PlateTableCellElement`
  - removed td border in favor of td::before. The latter is responsible of having the border and the selected background color.
  - z-index: td is 0, td::before is 10, td::before in selected state is 20, handle is 30, handle resize is 40.  
  - removed `selectedCell` div in favor of `::before`
- `TablePopover` -> `PlateTablePopover`
Styled props have been removed. 