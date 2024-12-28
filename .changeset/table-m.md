---
'@udecode/plate-table': major
---

Major performance improvement: all table cells were re-rendering on a single cell change. This is now fixed.

- `TablePlugin` now depends on `NodeIdPlugin`
- `TablePlugin` merging is now enabled by default:
  - Rename `enableMerging` to `disableMerge`
  - **Migration**:
    - `enableMerging: true` -> remove the option
    - else -> `TablePlugin.configure({ options: { disableMerge: true } })`
- Rename `unmergeTableCells` to `splitTableCell`
- Rename `editor.api.create.cell` to `editor.api.create.tableCell`
- `useTableMergeState` return: rename `canUnmerge` to `canSplit`
- `insertTableRow`, `insertTableColumn`: remove `disableSelect` in favor of `select`. **Migration**: Replace by the opposite boolean
- `getTableCellBorders`: params `(element, options)` -> `(editor, options)`. Remove `isFirstCell`, `isFirstRow` options
- Merged `useTableCellElementState` into `useTableCellElement`:
  - Remove parameter
  - Remove `hovered`, `hoveredLeft` returned values in favor of CSS
  - Rename `rowSize` return to `minHeight`
  - Computes column sizes and add `width` return
- Merged `useTableCellElementResizableState` into `useTableCellElementResizable`:
  - Remove `onHover`, `onHoverEnd` props in favor of CSS
- Merged `useTableElementState` into `useTableElement`:
  - Remove parameter
  - Does not compute and return `colSizes`, `minColumnWidth`, `colGroupProps` anymore.
