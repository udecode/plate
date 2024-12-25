import {
  type HtmlDeserializer,
  type OmitFirst,
  type PluginConfig,
  type TDescendant,
  bindFirst,
  createSlatePlugin,
  createTSlatePlugin,
} from '@udecode/plate-common';

import type { TTableCellElement, TableStoreCellAttributes } from './types';

import { getEmptyCellNode, getEmptyRowNode, getEmptyTableNode } from './api';
import { mergeTableCells, splitTableCell } from './merge';
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
}).extend(({ type }) => ({
  parsers: {
    html: {
      deserializer: {
        attributeNames: ['rowspan', 'colspan'],
        parse: getParse(type),
        rules: [{ validNodeName: 'TD' }],
      },
    },
  },
}));

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
}).extend(({ type }) => ({
  parsers: {
    html: {
      deserializer: {
        attributeNames: ['rowspan', 'colspan'],
        parse: getParse(type),
        rules: [{ validNodeName: 'TH' }],
      },
    },
  },
}));

export type TableConfig = PluginConfig<
  'table',
  {
    /** @private Keeps Track of cell indices. */
    _cellIndices?: TableStoreCellAttributes;

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
  TableApi,
  TableTransforms
>;

type TableApi = {
  create: {
    table: OmitFirst<typeof getEmptyTableNode>;
    /** Cell node factory used each time a cell is created. */
    tableCell: OmitFirst<typeof getEmptyCellNode>;
    tableRow: OmitFirst<typeof getEmptyRowNode>;
  };
  table: {
    getCellBorders: OmitFirst<typeof getTableCellBorders>;
    getCellChildren: (cell: TTableCellElement) => TDescendant[];
    getCellSize: OmitFirst<typeof getTableCellSize>;
    getColSpan: typeof getColSpan;
    getRowSpan: typeof getRowSpan;
  };
};

type TableTransforms = {
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
};

/** Enables support for tables. */
export const BaseTablePlugin = createTSlatePlugin<TableConfig>({
  key: 'table',
  extendEditor: withTable,
  node: { isElement: true },
  options: {
    _cellIndices: new WeakMap(),
    disableMerge: false,
    minColumnWidth: 48,
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
  .extendEditorApi<TableApi>(({ editor }) => ({
    create: {
      table: bindFirst(getEmptyTableNode, editor),
      tableCell: bindFirst(getEmptyCellNode, editor),
      tableRow: bindFirst(getEmptyRowNode, editor),
    },
    table: {
      getCellBorders: bindFirst(getTableCellBorders, editor),
      getCellChildren: (cell) => cell.children,
      getCellSize: bindFirst(getTableCellSize, editor),
      getColSpan: getColSpan,
      getRowSpan: getRowSpan,
    },
  }))
  .extendEditorTransforms<TableTransforms>(({ editor }) => ({
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
  }));

const getParse = (type: string): HtmlDeserializer['parse'] => {
  return ({ element }) => {
    const background =
      element.style.background || element.style.backgroundColor;

    if (background) {
      return {
        background,
        type,
      };
    }

    return { type };
  };
};
