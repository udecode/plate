---
"@platejs/table": major
---

- Add Plite-native table factories, queries, selectors, and transaction commands
- Batch related cell-border writes as one undoable transaction
- Register table, row, and cell properties in compiled schemas

**Migration:** Replace table factories with `editor.api.table.createCell`,
`createRow`, and `createTable`. Replace table commands with
`editor.update.insert.table/tableColumn/tableRow`,
`editor.update.remove.table/tableColumn/tableRow`, and
`editor.update.table.merge/split`. Remove `nextBlock` from insertion options;
use `{ at, select }` for exact placement and selection.
