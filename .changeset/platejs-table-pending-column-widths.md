---
'platejs': patch
---

Give each column of a table its own width while a suggested column insertion or deletion waits. `api.table.columnWidths` and `read.table.cell` show a struck column at its old width and an inserted column at its new one. `api.table.createResize` throws a `RangeError` for a column edge while such a change waits, and a row edge still resizes. `useTableResize` discards a drag when the view switches between Editing and Suggesting. A DOCX export writes one column grid per table, taken from the first column group or row in its HTML.
