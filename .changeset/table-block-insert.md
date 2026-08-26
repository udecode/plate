---
'@platejs/table': major
---

Require React and React DOM 19.2 or newer.

Use `useTableSelectionDOM(tableRef)` as the sole package React primitive for a custom table renderer. Compose transient column, row, and margin state, cell layout reads, and pointer handlers in the renderer through `TablePlugin` and Core selector hooks. Replace `useTableSelectionDom` and the old renderer-state hook family with this DOM lifecycle hook and the matching scoped capabilities.

Derive merge and split eligibility from `editor.plugin(TablePlugin).read.selection()`. The copied `table` owns transient column, row, and margin overrides plus row rendering.

Export `TablePluginState` as the complete mutable state contract for `BaseTablePlugin`.

Consolidate pure table factories and schema services into `editor.api.table`, snapshot queries into `editor.read.table`, and mutations into `editor.update.table`. Register validated table structure and properties in the compiled schema, including versioned validation for cell attributes, borders, and column sizes. Store table-cell spans only in numeric `colSpan` and `rowSpan` fields.

Validate spans as positive safe integers, row heights as positive finite numbers, and border widths as non-negative finite numbers. Represent unknown partial column widths with `null` instead of `0`.

Repair malformed grids and paste rectangular cell fragments across merged-cell boundaries. Keep paste, drag-and-drop, and compound table commands targeting the intended rows and cells after earlier edits.

Represent multi-cell pointer drags as directional core `NodeSelection` values, preserve them when clearing cells, and leave same-cell text drags native. Derive rectangular cell geometry through `editor.plugin(TablePlugin).read.selection(at?)`.

Return live cell entries, anchors, bounds, and table identity from the sole Table selection read. Use core `selection.nodes()` and `selection.contains()` for generic membership. Persisted table element IDs remain ordinary schema data.

**Migration:** Replace direct table helper imports with the matching scoped capability:

```tsx
editor.api.table.create({ colCount: 3, rowCount: 2 });
editor.plugin(TablePlugin).read.selection();
editor.update.table.insert({ colCount: 3, rowCount: 2 });
editor.update.table.insertColumn();
editor.update.table.removeRow();
editor.update.table.merge();
```

Remove `nextBlock` from insertion options; use `{ at, select }` for exact placement and selection.

Replace persisted `attributes.colspan` and `attributes.rowspan` with `colSpan` and `rowSpan`. HTML import and rendering continue to use lowercase DOM attributes.

Install table row and cell descriptors through required plugin dependencies. Persist every data or header cell as `tableCell`; set `header: true` for cells that render as `<th>`. `BaseTableCellHeaderPlugin`, `TableCellHeaderPlugin`, `TableCellHeaderElement`, and `TableCellHeaderElementStatic` are not part of the table surface.

Add the shared v54 document step when loading documents that persisted header cells under the legacy `tableCellHeader` type:

```tsx
import { defineDocumentMigrations, migratePlateV54 } from 'platejs/migrations';

const migrations = defineDocumentMigrations(EditorSchema, {
  steps: { 54: migratePlateV54 },
  unversioned: 53,
});
```

Replace `editor.api.table.getCellTypes()` with `editor.plugin(TableCellPlugin).schema.type`; tables have one cell element type.

Use `getCellIndices(cell)` for row and column coordinates and `getAdjacentCell({ deltaCol, deltaRow })` for neighboring cells. Border batch mutation is private to the table command owner; public callers use `setBorderSize` or `toggleBorders`.

Use exact clipboard slices through `readSlice` and `writeSlice`, and preserve projected row and cell children when exporting directional node selections through the core slice read.

Use semantic table fields and store column widths only on tables.
