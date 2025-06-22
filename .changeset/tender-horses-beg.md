---
'@platejs/selection': patch
---

- Added `sort` and `collapseTableRows` options to `editor.blockSelection.getNodes()` method.

- Added `normalize` function to handle table selection logic in `useSelectionArea` hook for improved table row and table element selection behavior.
  - It is now possible to select the entire table (table), but the rows (tr) will only be selected if your selection box is within the table.
