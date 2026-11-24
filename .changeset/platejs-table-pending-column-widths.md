---
'platejs': patch
---

Give each column its own width while a suggested column insertion or deletion waits. `api.table.columnWidths` and `read.table.cell` show a struck column at its old width and an inserted one at its new width. Column edges do not resize until the suggestion is decided, and `api.table.createResize` throws a `RangeError` for one; row edges still resize.
