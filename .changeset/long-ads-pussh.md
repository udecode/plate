---
"@udecode/plate-ui-table": patch
---

Fix:
- Slate should not throw anymore when clicking around the table
- Resizing columns should resize on drag. Moved the atoms into `tableStore`, `useTableStore`:
  - `hoveredColIndexAtom`
  - `resizingColAtom`
  - `selectedCellsAtom`
