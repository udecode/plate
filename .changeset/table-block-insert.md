---
"@platejs/table": major
---

Consolidate table factories and queries into `editor.api.table`, updates into
`editor.update.table`, and register validated table structure and properties in
the compiled schema, including versioned validation for cell attributes,
borders, and column sizes. Store table-cell spans only in numeric `colSpan` and
`rowSpan` fields.

Repair malformed grids and paste rectangular cell fragments across merged-cell
boundaries. Keep paste, drag-and-drop, and compound table commands targeting
the intended rows and cells after earlier edits.

Represent multi-cell pointer drags as structural table selections, preserve
them when clearing cells, and leave same-cell text drags native.

**Migration:** Replace direct table helper imports and root table APIs with
`editor.api.table.*`. Run mutations through `editor.update.table`:

```tsx
editor.api.table.create({ colCount: 3, rowCount: 2 });
editor.update.table.insert({ colCount: 3, rowCount: 2 });
editor.update.table.insertColumn();
editor.update.table.removeRow();
editor.update.table.merge();
```

Remove `nextBlock` from insertion options; use `{ at, select }` for exact
placement and selection.

Replace persisted `attributes.colspan` and `attributes.rowspan` with `colSpan`
and `rowSpan`. HTML import and rendering continue to use lowercase DOM
attributes.

Install table row, cell, and header descriptors through required plugin
dependencies.
