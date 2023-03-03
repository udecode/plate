---
"@udecode/plate-ui-table": major
---

- `TableElement`:
  - removed table border to set it at the cell level
  - `margin-left: 1px` to support cell borders
  - if all columns have a fixed size, the table will have a dynamic width instead of always 100%
  - new prop: `minColWidth` – Minimum column width. Default is 48.
  - `onMouseDown` will collapse the selection if some cells are selected
