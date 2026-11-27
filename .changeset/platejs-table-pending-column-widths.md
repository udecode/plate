---
'platejs': patch
---

Give each column its own width while a suggested column insertion or deletion waits. `api.table.columnWidths` and `read.table.cell` show a struck column at its old width and an inserted one at its new width. `api.table.createResize` throws a `RangeError` for every edge while the table waits as a suggested deletion or holds a pending row, column or format suggestion.
