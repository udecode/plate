---
"@udecode/plate-ui-table": major
---

- `TableElement`:
  - new prop: `minColWidth?: number` – Minimum column width. Default is 48.
  - `onMouseDown` will collapse the selection if some cells are selected
Styling:
  - removed table border to set it at the cell level
  - `margin-left: 1px` to support cell borders
  - if all columns have a fixed size, the table will have a dynamic width instead of always 100%
- `TableCellElement`:
  - new prop `resizableProps.step?: number`: Resize by step instead of by pixel.
Styling:
    - removed td border in favor of td::before. The latter is responsible of having the border and the selected background color.
  - z-index: td is 0, td::before is 10, td::before in selected state is 20, handle is 30, handle resize is 40.  
  - removed `selectedCell` div in favor of `::before`
