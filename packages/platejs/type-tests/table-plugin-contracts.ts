import {
  type ElementEntry,
  type NamedRootKey,
  type NodeKey,
  type NodeSelection,
  type Point,
  type Range,
  definePlugin,
} from 'platejs';
import {
  BaseTableCellPlugin,
  BaseTablePlugin,
  BaseTableRowPlugin,
  type TableBorderStates,
  type TableCellElement,
  type TableCellInfo,
  type TableElement,
  type TablePluginState,
  type TableResize,
  type TableRowElement,
  type TableSelection,
  type TableTargetOptions,
} from 'platejs/table';
import {
  TableCellPlugin,
  TablePlugin,
  type TableResizeHandle,
  TableRowPlugin,
  useTableResize,
} from 'platejs/table/react';

type AssertFalse<T extends false> = T;
type IsAny<T> = 0 extends 1 & T ? true : false;

type _tablePluginNotAny = AssertFalse<IsAny<typeof TablePlugin>>;
type _baseTablePluginNotAny = AssertFalse<IsAny<typeof BaseTablePlugin>>;

declare const cellKey: NodeKey;
declare const cellElement: TableCellElement;
declare const rowElement: TableRowElement;
declare const tableElement: TableElement;
declare const nodeSelection: NodeSelection;
declare const point: Point;
declare const range: Range;

const targetOptions: readonly TableTargetOptions[] = [
  {},
  { at: [0, 0, 0] },
  { at: point },
  { at: range },
  { at: cellKey },
  { at: cellElement },
  { at: rowElement },
  { at: tableElement },
  { at: nodeSelection },
];

const initialState = {
  allowCellSpanEditing: false,
  defaultTableWidth: null,
  expandOnPaste: false,
  minColumnWidth: 48,
} satisfies TablePluginState;

BaseTablePlugin.configure({ initialState });
TablePlugin.configure({ initialState });

const canonicalCell = {
  children: [{ text: '' }],
  colSpan: 2,
  rowSpan: 3,
  type: 'tableCell',
} satisfies TableCellElement;

const stringSpanCell: TableCellElement = {
  children: [{ text: '' }],
  // @ts-expect-error Persisted spans are numbers.
  colSpan: '2',
  type: 'tableCell',
};

void canonicalCell;
void stringSpanCell;

const extendedTablePlugin = TablePlugin.extend((ctx) => {
  type _ctxNotAny = AssertFalse<IsAny<typeof ctx>>;
  type _editorNotAny = AssertFalse<IsAny<typeof ctx.editor>>;

  const table = ctx.editor.plugin(TablePlugin);
  const selected = table.read.selection({ at: nodeSelection });
  const cell = table.read.cell({ at: cellKey });
  const borders = table.read.borders({ at: nodeSelection });
  const widths = table.api.columnWidths(tableElement);
  const calculateResize = table.api.createResize(tableElement, {
    colIndex: 0,
    edge: 'right',
  });

  type _selectionNotAny = AssertFalse<IsAny<typeof selected>>;
  type _cellNotAny = AssertFalse<IsAny<typeof cell>>;
  type _bordersNotAny = AssertFalse<IsAny<typeof borders>>;
  type _widthsNotAny = AssertFalse<IsAny<typeof widths>>;

  selected satisfies TableSelection | null;
  cell satisfies TableCellInfo | null;
  borders satisfies TableBorderStates | null;
  widths satisfies readonly number[];
  calculateResize satisfies (delta: number) => TableResize;
  table.read.canMerge({ at: nodeSelection }) satisfies boolean;
  table.read.canSplit({ at: cellElement }) satisfies boolean;

  if (selected) {
    selected.table satisfies ElementEntry<TableElement>;
    selected.cells satisfies ReadonlyArray<ElementEntry<TableCellElement>>;
    selected.anchor satisfies NodeKey;
    selected.focus satisfies NodeKey;
    selected.tableKey satisfies NodeKey;
    selected.root satisfies NamedRootKey | undefined;
    selected.rectangular satisfies boolean;
    selected.bounds.minCol satisfies number;
    selected.bounds.maxRow satisfies number;

    // @ts-expect-error Selection membership is an immutable read answer.
    selected.cells.push([cellElement, [0, 0, 0]]);
  }
  if (cell) {
    cell.entry satisfies ElementEntry<TableCellElement>;
    cell.root satisfies NamedRootKey | undefined;
    cell.row satisfies number;
    cell.col satisfies number;
    cell.rowSpan satisfies number;
    cell.colSpan satisfies number;
    cell.size.width satisfies number;
    cell.size.minHeight satisfies number;
    cell.borders.right.color satisfies string;
    cell.borders.bottom.style satisfies string;
    cell.borders.left?.width satisfies number | undefined;
  }
  if (borders) {
    borders.outer satisfies boolean | 'mixed';
    borders.none satisfies boolean | 'mixed';
  }

  const results: readonly boolean[] = [
    table.update.insert({ columns: 2, header: true, rows: 3 }, { at: point }),
    table.update.insertColumn({ at: cellKey, before: true, select: false }),
    table.update.insertRow({ at: rowElement, header: true }),
    table.update.remove({ at: tableElement }),
    table.update.removeColumn({ at: nodeSelection }),
    table.update.removeRow({ at: rowElement }),
    table.update.merge({ at: nodeSelection }),
    table.update.split({ at: cellKey }),
    table.update.setCellBackground({ at: nodeSelection, color: null }),
    table.update.toggleBorders({ at: nodeSelection, border: 'outer' }),
    table.update.setBorders({
      at: nodeSelection,
      border: 'all',
      value: { color: '#123456', style: 'dashed', width: 2 },
    }),
    table.update.resize({ at: tableElement, resize: calculateResize(24) }),
    table.update.setColumnWidth({ at: tableElement, colIndex: 0, width: 120 }),
    table.update.setRowHeight({ at: tableElement, height: 48, rowIndex: 0 }),
  ];

  table.update.insert();
  table.update.insert({}, { after: cellKey, select: false });
  table.update.insertColumn();
  table.update.insertRow();
  table.update.remove();
  table.update.removeColumn();
  table.update.removeRow();
  table.update.merge();
  table.update.split();
  table.update.setBorders({ border: 'left', value: null });
  table.update.toggleBorders({ border: 'none' });
  table.update.setCellBackground({ color: '#eee' });
  table.api.createResize(tableElement, { edge: 'left' })(
    8
  ) satisfies TableResize;
  table.api.createResize(tableElement, {
    edge: 'bottom',
    height: 48,
    rowIndex: 0,
  })(8) satisfies TableResize;
  table.update.resize({
    resize: {
      columns: [{ colIndex: 0, width: 120 }],
      edge: 'left',
      marginLeft: 12,
    },
  });
  table.update.resize({ resize: { edge: 'bottom', height: 48, rowIndex: 0 } });

  for (const options of targetOptions) {
    table.read.selection(options) satisfies TableSelection | null;
    table.read.borders(options) satisfies TableBorderStates | null;
    table.read.canMerge(options) satisfies boolean;
    table.read.canSplit(options) satisfies boolean;
  }

  // @ts-expect-error Cell reads require a single-cell target.
  table.read.cell({ at: nodeSelection });
  // @ts-expect-error A live table element is not a cell target.
  table.read.cell({ at: tableElement });
  // @ts-expect-error Insertion placement has one authoritative location.
  table.update.insert({}, { after: cellKey, at: [0] });
  // @ts-expect-error Absolute column sizing requires a logical column index.
  table.update.setColumnWidth({ at: tableElement, width: 120 });
  // @ts-expect-error Size commits target one table, not a cell set.
  table.update.setRowHeight({ at: nodeSelection, height: 48, rowIndex: 0 });
  // @ts-expect-error A horizontal resize commit requires at least one column.
  table.update.resize({ resize: { columns: [], edge: 'right' } });
  table.update.resize({
    // @ts-expect-error Left-edge resizing must carry the resulting indentation.
    resize: { columns: [{ colIndex: 0, width: 120 }], edge: 'left' },
  });
  table.update.resize({
    resize: {
      columns: [{ colIndex: 0, width: 120 }],
      edge: 'right',
      // @ts-expect-error Right-edge resizing cannot set table indentation.
      marginLeft: 12,
    },
  });

  ctx.editor.update.table.insert({ columns: 2, rows: 2 }) satisfies boolean;
  ctx.editor.update.table.removeRow() satisfies boolean;
  ctx.editor.read((state) => {
    state.table.selection({
      at: nodeSelection,
    }) satisfies TableSelection | null;
    state.table.cell({ at: cellKey }) satisfies TableCellInfo | null;
  });
  ctx.editor.update((tx) => {
    tx.plugin(TablePlugin).merge({ at: nodeSelection }) satisfies boolean;
    tx.plugin(TablePlugin.name).setCellBackground({
      at: nodeSelection,
      color: null,
    }) satisfies boolean;
  });

  void results;

  return {
    initialState,
  };
});

void extendedTablePlugin;

const tableDependentPlugin = definePlugin('tableDependent', {
  dependencies: [BaseTablePlugin],
}).extend(({ editor }) => ({
  api: () => ({
    selectedTableWidths: () => {
      const table = editor.plugin(BaseTablePlugin);
      const selection = table.read.selection();

      return selection ? table.api.columnWidths(selection.table[0]) : [];
    },
  }),
}));

const stagedTablePlugin = BaseTablePlugin.extend(({ api }) => ({
  api: () => ({
    columnCount: (element: TableElement) => api.columnWidths(element).length,
  }),
})).extend(({ plugin }) => ({
  update: ({ tx }) => ({
    hideLeftBorder: () => {
      tx.plugin(plugin.name).setBorders({
        border: 'left',
        value: { width: 0 },
      }) satisfies boolean;

      const selection = tx.selection();
      const tableSelection = tx.table.selection();

      return { selection, tableSelection };
    },
  }),
}));

void tableDependentPlugin;
void stagedTablePlugin;
void BaseTableCellPlugin;
void BaseTableRowPlugin;
void TableCellPlugin;
void TableRowPlugin;
void useTableResize;
void ({ colIndex: 0, edge: 'right' } satisfies TableResizeHandle);
