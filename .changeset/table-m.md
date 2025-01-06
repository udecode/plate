---
'@udecode/plate-table': major
---

**Major performance improvement**: all table cells were re-rendering when a single cell changed. This is now fixed.

- `TablePlugin` now depends on `NodeIdPlugin`.
- Table merging is now enabled by default:
  - Renamed `enableMerging` to `disableMerge`.
  - **Migration**:
    - `enableMerging: true` → remove the option.
    - otherwise → `TablePlugin.configure({ options: { disableMerge: true } })`
- Renamed `unmergeTableCells` to `splitTableCell`.
- Renamed `editor.api.create.cell` to `editor.api.create.tableCell`.
- In `useTableMergeState`, renamed `canUnmerge` to `canSplit`.
- `insertTableRow` and `insertTableColumn`: removed `disableSelect` in favor of `select`. **Migration**: replace it with the opposite boolean.
- `getTableCellBorders`: params `(element, options)` → `(editor, options)`; removed `isFirstCell` and `isFirstRow`.
- Merged `useTableCellElementState` into `useTableCellElement`:
  - Removed its parameter.
  - Removed `hovered` and `hoveredLeft` returns (use CSS instead).
  - Renamed `rowSize` to `minHeight`.
  - Computes column sizes and returns `width`.
- Merged `useTableCellElementResizableState` into `useTableCellElementResizable`:
  - Removed `onHover` and `onHoverEnd` props (use CSS instead).
- Merged `useTableElementState` into `useTableElement`:
  - Removed its parameter.
  - No longer computes and returns `colSizes`, `minColumnWidth`, and `colGroupProps`.
