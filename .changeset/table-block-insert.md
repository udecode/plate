---
"@platejs/table": major
---

Export `TablePluginState` as the complete mutable state contract for
`BaseTablePlugin`.

Consolidate pure table factories and schema services into `editor.api.table`,
snapshot queries into `editor.read.table`, and mutations into
`editor.update.table`. Register validated table structure and properties in the
compiled schema, including versioned validation for cell attributes, borders,
and column sizes. Store table-cell spans only in numeric `colSpan` and
`rowSpan` fields.

Repair malformed grids and paste rectangular cell fragments across merged-cell
boundaries. Keep paste, drag-and-drop, and compound table commands targeting
the intended rows and cells after earlier edits.

Represent multi-cell pointer drags as structural table selections, preserve
them when clearing cells, and leave same-cell text drags native.
Publish that table-cell payload through `BaseTablePlugin.selectionKinds` as
the single runtime and type contract. Editors infer table-cell reads and writes
only when the Table plugin is installed.

Name live selection identity `cellKeys` and `tableKey`. Read selected live
targets with `getSelectedCellKeys`, `getSelectedTableKeys`, and
`getCellIndicesByKey`; persisted table element IDs remain ordinary schema data.
Cache table-selection projections by the stable snapshot index rather than a
short-lived read facade, including named-root editor views.

**Migration:** Replace direct table helper imports with the matching scoped
capability:

```tsx
editor.api.table.create({ colCount: 3, rowCount: 2 });
editor.read.table.getSelectedCells();
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

Install table row and cell descriptors through required plugin dependencies.
Persist every data or header cell as `tableCell`; set `header: true` for cells
that render as `<th>`. `BaseTableCellHeaderPlugin`, `TableCellHeaderPlugin`,
`TableCellHeaderElement`, and `TableCellHeaderElementStatic` are not part of
the table surface.

Install `TableV54MigrationPlugin` temporarily when loading documents that
persisted header cells under the legacy `tableCellHeader` type:

```tsx
import { TableV54MigrationPlugin } from '@platejs/table/migrations';

const editor = createPlateEditor({
  plugins: [TableV54MigrationPlugin, TablePlugin],
  initialValue,
});
```

Save the converted document, then remove the migration plugin.

Replace `editor.api.table.getCellTypes()` with
`editor.plugin(TableCellPlugin).schema.type`; tables have one cell
element type.

Use `getCellIndices(cell)` for row and column coordinates,
`getAdjacentCell({ deltaCol, deltaRow })` for neighboring cells, and
`getGridByRange(range)` for range grids. Border batch mutation is private to
the table command owner; public callers use `setBorderSize` or
`toggleBorders`.

Use exact clipboard slices through `readSlice` and `writeSlice`, preserve
projected row and cell children when exporting table selections through
`exportSlice`, and declare table selection DOM projection through
`primaryRange`.
