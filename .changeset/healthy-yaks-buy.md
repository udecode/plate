---
"@udecode/plate-table": minor
---

- `TablePlugin` new option: `initialTableWidth` – If defined, a normalizer will set each undefined table `colSizes` to this value divided by the number of columns. Merged cells not yet supported. If not defined, the table column sizes will stay to `auto`.
- `insertTableColumn`: if option `initialTableWidth` is defined, the column size will be set to (a) the size of the next column if defined, (b) the size of the current column if it's the last one or (c) `initialTableWidth / colSizes.length`. If not defined, the column size stays to `auto`.
- Headless UI:
  - `TableElement`:
    - `onMouseDown` will collapse the selection if some cells are selected
  - `TableCellElement`
    - new prop `resizableProps.step?: number`: Resize by step instead of by pixel.
  - `TableRowElement`
  


