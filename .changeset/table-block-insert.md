---
"@platejs/table": major
---

Consolidate table factories, queries, selectors, and updates into the scoped
`TablePlugin` portal, and register table structure in the compiled schema.

**Migration:** Replace direct table helper imports and root table APIs with
`editor.plugin(TablePlugin).api.*`. Run mutations through the same portal:

```tsx
const table = editor.plugin(TablePlugin);

table.api.create({ colCount: 3, rowCount: 2 });
table.update.insert({ colCount: 3, rowCount: 2 });
table.update.insertColumn();
table.update.removeRow();
table.update.merge();
```

Remove `nextBlock` from insertion options; use `{ at, select }` for exact
placement and selection.
