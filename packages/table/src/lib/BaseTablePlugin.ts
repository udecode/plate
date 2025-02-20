import {
  type Descendant,
  type HtmlDeserializer,
  type OmitFirst,
  type PluginConfig,
  type TElement,
  bindFirst,
  createSlatePlugin,
  createTSlatePlugin,
} from '@udecode/plate';

import type { TTableCellElement } from './types';
import type { CellIndices } from './utils';

import { getEmptyCellNode, getEmptyRowNode, getEmptyTableNode } from './api';
import { mergeTableCells, splitTableCell } from './merge';
import { normalizeInitialValueTable } from './normalizeInitialValueTable';
import {
  getColSpan,
  getRowSpan,
  getTableCellBorders,
  getTableCellSize,
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
  key: 'tr',
  node: { isElement: true },
  parsers: {
    html: {
      deserializer: {
        rules: [{ validNodeName: 'TR' }],
      },
    },
  },
});

export const BaseTableCellPlugin = createSlatePlugin({
  key: 'td',
  node: {
    dangerouslyAllowAttributes: ['colspan', 'rowspan'],
    isElement: true,
    props: ({ element }) => ({
      nodeProps: {
        colSpan: (element?.attributes as any)?.colspan,
        rowSpan: (element?.attributes as any)?.rowspan,
      },
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
});

export const BaseTableCellHeaderPlugin = createSlatePlugin({
  key: 'th',
  node: {
    dangerouslyAllowAttributes: ['colspan', 'rowspan'],
    isElement: true,
    props: ({ element }) => ({
      nodeProps: {
        colSpan: (element?.attributes as any)?.colspan,
        rowSpan: (element?.attributes as any)?.rowspan,
      },
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
});

export type TableConfig = PluginConfig<
  'table',
  {
    /** @private Keeps Track of cell indices by id. */
    _cellIndices: Record<string, { col: number; row: number }>;
    /** The currently selected cells. */
    selectedCells: TElement[] | null;
    /** The currently selected tables. */
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
      getColSpan: typeof getColSpan;
      getRowSpan: typeof getRowSpan;
      getCellChildren: (cell: TTableCellElement) => Descendant[];
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
  }
>;

/** Enables support for tables. */
export const BaseTablePlugin = createTSlatePlugin<TableConfig>({
  key: 'table',
  // dependencies: [NodeIdPlugin.key],
  node: {
    isElement: true,
  },
  normalizeInitialValue: normalizeInitialValueTable,
  options: {
    _cellIndices: {},
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
  .extendSelectors<TableConfig['selectors']>(({ getOptions }) => ({
    cellIndices: (id) => getOptions()._cellIndices[id],
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
      getColSpan: getColSpan,
      getRowSpan: getRowSpan,
      getCellChildren: (cell) => cell.children,
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
