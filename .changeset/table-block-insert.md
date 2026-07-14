---
"@platejs/table": major
---

Use Plite-native table factories, queries, selectors, and transaction commands.
Table behavior stays in its existing extension owners, while React-only
clipboard and keyboard behavior stays in `TablePlugin`.
Batch related cell-border writes with `setBorderSizes` so one toolbar action is
one undoable transaction.

**Migration:** Replace table factories with `editor.api.table.createCell`,
`createRow`, and `createTable`. Replace table commands with
`editor.update.insert.table/tableColumn/tableRow`,
`editor.update.remove.table/tableColumn/tableRow`, and
`editor.update.table.merge/split`. Remove `nextBlock` from insertion options;
use `{ at, select }` for exact placement and selection.
