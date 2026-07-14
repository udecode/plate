import {
  type HtmlDeserializer,
  type PlatePluginTxGroup,
  type PluginConfig,
  createBasePlugin,
} from '@platejs/core';
import type { Descendant, Element } from '@platejs/plite';
import { KEYS, type TTableCellElement } from '@platejs/utils';
import { type OmitFirst, bindFirst } from '@udecode/utils';

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
import { withApplyTable } from './withApplyTable';
import { withDeleteTable } from './withDeleteTable';
import { withGetFragmentTable } from './withGetFragmentTable';
import { withInsertFragmentTable } from './withInsertFragmentTable';
import { withInsertTextTable } from './withInsertTextTable';
import { withNormalizeTable } from './withNormalizeTable';
import { withTableCellSelection } from './withTableCellSelection';

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

const getCellAttributeProps = (element?: Descendant) => {
  const attributes = (element as TTableCellElement | undefined)?.attributes;

  return {
    colSpan: attributes?.colspan,
    rowSpan: attributes?.rowspan,
  };
};

export const BaseTableRowPlugin = createBasePlugin({
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

export const BaseTableCellPlugin = createBasePlugin({
  key: KEYS.td,
  node: {
    dangerouslyAllowAttributes: ['colspan', 'rowspan'],
    isContainer: true,
    isElement: true,
    isStrictSiblings: true,
    props: ({ element }) => getCellAttributeProps(element),
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

export const BaseTableCellHeaderPlugin = createBasePlugin({
  key: KEYS.th,
  node: {
    dangerouslyAllowAttributes: ['colspan', 'rowspan'],
    isContainer: true,
    isElement: true,
    isStrictSiblings: true,
    props: ({ element }) => getCellAttributeProps(element),
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
    table: {
      /** Cell node factory used each time a cell is created. */
      createCell: OmitFirst<typeof getEmptyCellNode>;
      createRow: OmitFirst<typeof getEmptyRowNode>;
      createTable: OmitFirst<typeof getEmptyTableNode>;
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
      table: OmitFirst<OmitFirst<typeof insertTable>>;
      tableColumn: OmitFirst<OmitFirst<typeof insertTableColumn>>;
      tableRow: OmitFirst<OmitFirst<typeof insertTableRow>>;
    };
    remove: {
      table: OmitFirst<OmitFirst<typeof deleteTable>>;
      tableColumn: OmitFirst<OmitFirst<typeof deleteColumn>>;
      tableRow: OmitFirst<OmitFirst<typeof deleteRow>>;
    };
    table: {
      merge: OmitFirst<OmitFirst<typeof mergeTableCells>>;
      split: OmitFirst<OmitFirst<typeof splitTableCell>>;
    };
  },
  {
    cellIndices?: (id: string) => CellIndices;
    isCellSelected?: (id?: string | null) => boolean;
    isSelectingCell?: () => boolean;
    selectedCell?: (id?: string | null) => Element | null;
    selectedCellIds?: () => string[] | null;
    selectedCells?: () => Element[] | null;
    selectedTableIds?: () => string[] | null;
    selectedTables?: () => Element[] | null;
  }
>;

/** Enables support for tables. */
export const BaseTablePlugin = createBasePlugin<TableConfig>({
  key: KEYS.table,
  node: {
    isContainer: true,
    isElement: true,
  },
  transformInitialValue: normalizeInitialValueTable,
  options: {
    _cellIndices: {},
    _selectedCellIds: undefined,
    _selectedTableIds: undefined,
    _selectionVersion: 0,
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
    table: {
      createCell: bindFirst(getEmptyCellNode, editor),
      createRow: bindFirst(getEmptyRowNode, editor),
      createTable: bindFirst(getEmptyTableNode, editor),
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
  .extendTxGroup<'insert', PlatePluginTxGroup<TableConfig['tx']['insert']>>(
    'insert',
    ({ editor }) =>
      (tx) => ({
        table: (tableOptions, options) =>
          insertTable(editor, tx, tableOptions, options),
        tableColumn: (options) => insertTableColumn(editor, tx, options),
        tableRow: (options) => insertTableRow(editor, tx, options),
      })
  )
  .extendTxGroup<'remove', PlatePluginTxGroup<TableConfig['tx']['remove']>>(
    'remove',
    ({ editor }) =>
      (tx) => ({
        table: () => deleteTable(editor, tx),
        tableColumn: () => deleteColumn(editor, tx),
        tableRow: () => deleteRow(editor, tx),
      })
  )
  .extendTxGroup<'table', PlatePluginTxGroup<TableConfig['tx']['table']>>(
    'table',
    ({ editor }) =>
      (tx) => ({
        merge: () => mergeTableCells(editor, tx),
        split: () => splitTableCell(editor, tx),
      })
  )
  .extendExtension(withApplyTable)
  .extendExtension(withDeleteTable)
  .extendExtension(withGetFragmentTable)
  .extendExtension(withInsertFragmentTable)
  .extendExtension(withInsertTextTable)
  .extendExtension(withNormalizeTable)
  .extendExtension(withTableCellSelection);
