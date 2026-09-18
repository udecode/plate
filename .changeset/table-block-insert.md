---
"platejs": major
---

Use the table API through `editor.plugin(TablePlugin)` with explicit targets, nullable reads, and boolean update results.

- Import headless descriptors and table types from `platejs/table`, and React descriptors and hooks from `platejs/table/react`.
- Insert tables with `{ rows, columns, header }`; use the separate placement argument for either `at` or `after`, plus block insertion options such as `select` and `replaceEmpty`. Default to two rows and two columns.
- Read exact cell membership and direction with `read.selection({ at? })`, cell layout with `read.cell({ at? })`, and tri-state border predicates with `read.borders({ at? })`.
- Check merge and split availability with `read.canMerge({ at? })` and `read.canSplit({ at? })`; apply formatting to the exact selected cells.
- Set complete border records with `update.setBorders({ at?, border, value })`; use `null` to clear an override and `width: 0` to hide an edge.
- Resolve column widths with `api.columnWidths(table)` and calculate resize previews with `api.createResize(table, target)`. Commit sizing through `update.resize({ at?, resize })`, `update.setColumnWidth({ at?, colIndex, width })`, or `update.setRowHeight({ at?, rowIndex, height })`.
- Configure `allowCellSpanEditing`, `expandOnPaste`, `defaultTableWidth`, and `minColumnWidth` through `initialState`. Keep transient sizing and presentation choices in the renderer.
- Preserve rich content and surviving node identities when merging cells. Fit complete clipboard slices with their owned roots; reject cropped table tiles, partial destination spans, and overflow when paste growth is disabled.
- Represent structural cell selections as directional `NodeSelection` values. Require span-complete rectangles for structural copy and cut, and clear cells only after a successful clipboard write.
- Store column widths on tables as `columnWidths`, using `null` for unknown imported widths. Store numeric `colSpan` and `rowSpan` directly on cells, and `height` on rows. Validate spans as positive safe integers, sizes as positive finite values, and border widths as non-negative finite values.
- Install row and cell descriptors automatically. Represent headers as `tableCell` with `header: true`.
- Require React and React DOM 19.2 or newer. Use `useTableSelectionDOM(tableRef)` for custom selection rendering and `useTableResize` for pointer resizing; render transient previews locally.

**Migration:** Replace direct table helper calls with the corresponding descriptor API. Use `rows` and `columns` for insertion, invert `disableMerge` into `allowCellSpanEditing`, invert `disableExpandOnInsert` into `expandOnPaste`, and configure fallback width with `defaultTableWidth`. In a transaction, call update methods on `tx.plugin(TablePlugin)`.

```tsx
import { TablePlugin } from 'platejs/table/react';

const table = editor.plugin(TablePlugin);

table.update.insert({ rows: 2, columns: 3 }, { select: true });
table.update.insertColumn({ before: true });

if (table.read.canMerge()) {
  table.update.merge();
}

editor.update((tx) => {
  tx.plugin(TablePlugin).setCellBackground({ color: '#fef9c3' });
});
```

Apply the shared `migrateV54` document step when loading stored header cells with the legacy `th` or `tableCellHeader` type. Migrate persisted `attributes.colspan` and `attributes.rowspan` to numeric `colSpan` and `rowSpan`; HTML continues to use lowercase attributes.
