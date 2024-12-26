---
'@udecode/plate-table': minor
---

- `TablePlugin` new api and transforms:

```ts
type TableApi = {
  create: {
    table: OmitFirst<typeof getEmptyTableNode>;
    /** Cell node factory used each time a cell is created. */
    tableCell: OmitFirst<typeof getEmptyCellNode>;
    tableRow: OmitFirst<typeof getEmptyRowNode>;
  };
  table: {
    getCellBorders: OmitFirst<typeof getTableCellBorders>;
    getCellSize: OmitFirst<typeof getTableCellSize>;
    getColSpan: typeof getColSpan;
    getRowSpan: typeof getRowSpan;
  };
};

type TableTransforms = {
  insert: {
    table: OmitFirst<typeof insertTable>;
  };
  remove: {
    table: OmitFirst<typeof deleteTable>;
    tableColumn: OmitFirst<typeof deleteColumn>;
    tableRow: OmitFirst<typeof deleteRow>;
  };
  table: {
    merge: OmitFirst<typeof mergeTableCells>;
    split: OmitFirst<typeof splitTableCell>;
  };
};
```

- `insertTableColumn` add `before` option to insert a column before the current column.
- `insertTableRow` add `before` option to insert a row before the current row.
- `insertTable` now supports inserting a table after the current table.
