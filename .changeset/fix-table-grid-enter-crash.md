---
"@platejs/table": patch
---

Fix crash when pressing Enter before a table on the homepage editor. `useTableColSizes` now reads the table element from React context (`useElement`) instead of re-reading from the editor via a potentially stale path, preventing `compileTableGrid` from receiving a non-table node during mid-transaction re-renders.
