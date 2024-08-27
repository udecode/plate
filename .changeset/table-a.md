---
'@udecode/plate-table': major
---

- `createTablePlugin` -> `TablePlugin`
- NEW `TableRowPlugin`, `TableCellPlugin`, `TableCellHeaderPlugin`
- Replace `insertTableColumn` with `editor.insert.tableColumn`
- Replace `insertTableRow` with `editor.insert.tableRow`
- Move `cellFactory` option to `create.cell` api
- Move `getCellChildren` option to `table.getCellChildren` api
