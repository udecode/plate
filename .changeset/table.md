---
"@udecode/plate-table": minor
---

- Fixes #1795
- Fixes #1794
- Fixes #1793
- Fixes #1791
- Fixes #1798
- `getTableCellEntry`:
  - renamed to `getTableEntries`
  - returns `table`, `row`, `cell`
  - is now working when selecting many blocks in a cell
- `moveSelectionFromCell`:
  - new option `fromOneCell` 
  - should not do anything when `at` is in a single cell, unless `fromOneCell` is `true`
- `overrideSelectionFromCell`: Override the new selection if the previous selection and the new one are in different cells
