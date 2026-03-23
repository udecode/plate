import {
  type Descendant,
  type HtmlDeserializer,
  type OmitFirst,
  type PluginConfig,
  type TElement,
  type TTableCellElement,
  bindFirst,
  createSlatePlugin,
  createTSlatePlugin,
  KEYS,
} from 'platejs';

import type { CellIndices } from './utils';

import { getEmptyCellNode, getEmptyRowNode, getEmptyTableNode } from './api';
import { mergeTableCells, splitTableCell } from './merge';
import { normalizeInitialValueTable } from './normalizeInitialValueTable';
import {
  getColSpan,
  getSelectedCell,
  getSelectedCellIds,
  getSelectedCells,
  getSelectedTableIds,
  getSelectedTables,
  getRowSpan,
  getTableCellBorders,
  getTableCellSize,
  isCellSelected,
  isSelectingCell,
} from './queries';
import {
  deleteColumn,
  deleteRow,
  deleteTable,
  insertTable,
  insertTableColumn,
  insertTableRow,
} from './transforms/index';
import { withTable } from './withTable';

const parse: HtmlDeserializer['parse'] = ({ element, type }) => {
  const background = element.style.background || element.style.backgroundColor;

  if (background) {
    return {
      background,
      type,
    };
  }

  return { type };
};

export const BaseTableRowPlugin = createSlatePlugin({
  key: KEYS.tr,
  node: { isContainer: true, isElement: true, isStrictSiblings: true },
  parsers: {
    html: {
      deserializer: {
        rules: [{ validNodeName: 'TR' }],
      },
    },
  },
});

export const BaseTableCellPlugin = createSlatePlugin({
  key: KEYS.td,
  node: {
    dangerouslyAllowAttributes: ['colspan', 'rowspan'],
    isContainer: true,
    isElement: true,
    isStrictSiblings: true,
    props: ({ element }) => ({
      colSpan: (element?.attributes as any)?.colspan,
      rowSpan: (element?.attributes as any)?.rowspan,
    }),
  },
  parsers: {
    html: {
      deserializer: {
        attributeNames: ['rowspan', 'colspan'],
        parse,
        rules: [{ validNodeName: 'TD' }],
      },
    },
  },
  rules: {
    merge: { removeEmpty: false },
  },
});

export const BaseTableCellHeaderPlugin = createSlatePlugin({
  key: KEYS.th,
  node: {
    dangerouslyAllowAttributes: ['colspan', 'rowspan'],
    isContainer: true,
    isElement: true,
    isStrictSiblings: true,
    props: ({ element }) => ({
      colSpan: (element?.attributes as any)?.colspan,
      rowSpan: (element?.attributes as any)?.rowspan,
    }),
  },
  parsers: {
    html: {
      deserializer: {
        attributeNames: ['rowspan', 'colspan'],
        parse,
        rules: [{ validNodeName: 'TH' }],
      },
    },
  },
  rules: {
    merge: { removeEmpty: false },
  },
});

export type TableConfig = PluginConfig<
  'table',
  {
    /** @private Keeps Track of cell indices by id. */
    _cellIndices: Record<string, { col: number; row: number }>;
    /** @private Keeps track of selected cell ids for cheap membership checks. */
    _selectedCellIds: string[] | null | undefined;
    /** @private Keeps track of selected table ids for cheap table checks. */
    _selectedTableIds: string[] | null | undefined;
    /** @private Forces selection-derived selectors to refresh. */
    _selectionVersion: number;
    /** Legacy selector key. Selected cells are derived from editor selection. */
    selectedCells: TElement[] | null;
    /** Legacy selector key. Selected tables are derived from editor selection. */
    selectedTables: TElement[] | null;
    /** Disable expanding the table when inserting cells. */
    disableExpandOnInsert?: boolean;
    // Disable first column left resizer.
    disableMarginLeft?: boolean;
    /**
     * Disable cell merging functionality.
     *
     * @default false
     */
    disableMerge?: boolean;
    /**
     * Disable unsetting the first column width when the table has one column.
     * Set it to true if you want to resize the table width when there is only
     * one column. Keep it false if you have a full-width table.
     */
    enableUnsetSingleColSize?: boolean;
    /**
     * If defined, a normalizer will set each undefined table `colSizes` to this
     * value divided by the number of columns. Merged cells not supported.
     */
    initialTableWidth?: number;
    /**
     * The minimum width of a column.
     *
     * @default 48
     */
    minColumnWidth?: number;
  },
  {
    create: {
      table: OmitFirst<typeof getEmptyTableNode>;
      /** Cell node factory used each time a cell is created. */
      tableCell: OmitFirst<typeof getEmptyCellNode>;
      tableRow: OmitFirst<typeof getEmptyRowNode>;
    };
    table: {
      getCellBorders: OmitFirst<typeof getTableCellBorders>;
      getCellSize: OmitFirst<typeof getTableCellSize>;
      getSelectedCell: OmitFirst<typeof getSelectedCell>;
      getSelectedCellIds: OmitFirst<typeof getSelectedCellIds>;
      getSelectedCells: OmitFirst<typeof getSelectedCells>;
      getSelectedTableIds: OmitFirst<typeof getSelectedTableIds>;
      getSelectedTables: OmitFirst<typeof getSelectedTables>;
      getColSpan: typeof getColSpan;
      getRowSpan: typeof getRowSpan;
      getCellChildren: (cell: TTableCellElement) => Descendant[];
      isCellSelected: OmitFirst<typeof isCellSelected>;
      isSelectingCell: OmitFirst<typeof isSelectingCell>;
    };
  },
  {
    insert: {
      table: OmitFirst<typeof insertTable>;
      tableColumn: OmitFirst<typeof insertTableColumn>;
      tableRow: OmitFirst<typeof insertTableRow>;
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
  },
  {
    cellIndices?: (id: string) => CellIndices;
    isCellSelected?: (id?: string | null) => boolean;
    isSelectingCell?: () => boolean;
    selectedCell?: (id?: string | null) => TElement | null;
    selectedCellIds?: () => string[] | null;
    selectedCells?: () => TElement[] | null;
    selectedTableIds?: () => string[] | null;
    selectedTables?: () => TElement[] | null;
  }
>;

/** Enables support for tables. */
export const BaseTablePlugin = createTSlatePlugin<TableConfig>({
  key: KEYS.table,
  node: {
    isContainer: true,
    isElement: true,
  },
  normalizeInitialValue: normalizeInitialValueTable,
  options: {
    _cellIndices: {},
    _selectedCellIds: undefined as string[] | null | undefined,
    _selectedTableIds: undefined as string[] | null | undefined,
    _selectionVersion: 0,
    disableMerge: false,
    minColumnWidth: 48,
    selectedCells: null as TElement[] | null,
    selectedTables: null as TElement[] | null,
  },
  parsers: {
    html: {
      deserializer: {
        rules: [{ validNodeName: 'TABLE' }],
      },
    },
  },
  plugins: [BaseTableRowPlugin, BaseTableCellPlugin, BaseTableCellHeaderPlugin],
})
  .extendSelectors<TableConfig['selectors']>(({ editor, getOptions }) => ({
    cellIndices: (id) => getOptions()._cellIndices[id],
    isCellSelected: (id) => {
      const selectedCellIds = getOptions()._selectedCellIds;

      if (selectedCellIds !== undefined) {
        return !!id && (selectedCellIds?.includes(id) ?? false);
      }

      return isCellSelected(editor, id);
    },
    isSelectingCell: () => {
      const selectedCellIds = getOptions()._selectedCellIds;

      if (selectedCellIds !== undefined) {
        return !!selectedCellIds;
      }

      return isSelectingCell(editor);
    },
    selectedCell: (id) => {
      void getOptions()._selectionVersion;

      return getSelectedCell(editor, id);
    },
    selectedCellIds: () => {
      const selectedCellIds = getOptions()._selectedCellIds;

      if (selectedCellIds !== undefined) {
        return selectedCellIds;
      }

      return getSelectedCellIds(editor);
    },
    selectedCells: () => {
      void getOptions()._selectionVersion;

      return getSelectedCells(editor);
    },
    selectedTableIds: () => {
      const selectedTableIds = getOptions()._selectedTableIds;

      if (selectedTableIds !== undefined) {
        return selectedTableIds;
      }

      return getSelectedTableIds(editor);
    },
    selectedTables: () => {
      void getOptions()._selectionVersion;

      return getSelectedTables(editor);
    },
  }))
  .extendEditorApi<TableConfig['api']>(({ editor }) => ({
    create: {
      table: bindFirst(getEmptyTableNode, editor),
      tableCell: bindFirst(getEmptyCellNode, editor),
      tableRow: bindFirst(getEmptyRowNode, editor),
    },
    table: {
      getCellBorders: bindFirst(getTableCellBorders, editor),
      getCellSize: bindFirst(getTableCellSize, editor),
      getSelectedCell: bindFirst(getSelectedCell, editor),
      getSelectedCellIds: bindFirst(getSelectedCellIds, editor),
      getSelectedCells: bindFirst(getSelectedCells, editor),
      getSelectedTableIds: bindFirst(getSelectedTableIds, editor),
      getSelectedTables: bindFirst(getSelectedTables, editor),
      getColSpan,
      getRowSpan,
      getCellChildren: (cell) => cell.children,
      isCellSelected: bindFirst(isCellSelected, editor),
      isSelectingCell: bindFirst(isSelectingCell, editor),
    },
  }))
  .extendEditorTransforms<TableConfig['transforms']>(({ editor }) => ({
    insert: {
      table: bindFirst(insertTable, editor),
      tableColumn: bindFirst(insertTableColumn, editor),
      tableRow: bindFirst(insertTableRow, editor),
    },
    remove: {
      table: bindFirst(deleteTable, editor),
      tableColumn: bindFirst(deleteColumn, editor),
      tableRow: bindFirst(deleteRow, editor),
    },
    table: {
      merge: bindFirst(mergeTableCells, editor),
      split: bindFirst(splitTableCell, editor),
    },
  }))
  .overrideEditor(withTable);
