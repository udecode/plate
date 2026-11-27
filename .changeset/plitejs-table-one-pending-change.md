---
'plitejs': patch
---

- Hold one pending row, column or format suggestion per table. Suggesting a second one, adding or removing a single cell, changing a span, moving or splitting a row, and an undo or redo that changes a table whose value or block window changed since its step while any pending mark waits there or the replayed step held one now refuse. After a history restore, an undo or redo that changes a table refuses in a document that holds a verdict or another authored record, unless it withdraws the writer's own pending change. A writer's own undo or redo of their pending row or column goes through when the sync room would take it.
- Record a whole column as one suggestion in a forced proposal.
- Refuse in Editing, while a table holds such a suggestion, inserting a row or column, moving a row or cell, removing some but not all columns, merging or splitting cells, and writing a property on the table, a row or a cell.
- Add `read.authored.gridLocked(node)`, which says whether a table waits as a suggested deletion or holds a pending row, column or format suggestion.
