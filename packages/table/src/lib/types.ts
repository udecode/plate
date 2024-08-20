import type {
  OmitFirst,
  PluginConfig,
  TDescendant,
  TElement,
} from '@udecode/plate-common';

import type { insertTableColumn, insertTableRow } from './transforms';

export type TableConfig = PluginConfig<
  'table',
  {
    /**
     * For internal use. Keeps track of cell indices. Used only when
     * enableMerging is true.
     */
    _cellIndices?: TableStoreCellAttributes;

    /** Disable expanding the table when inserting cells. */
    disableExpandOnInsert?: boolean;

    // Disable first column left resizer.
    disableMarginLeft?: boolean;

    /**
     * Enable cells merging functionality.
     *
     * @default false
     */
    enableMerging?: boolean;

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
  { table: TableApi },
  { table: TableTransforms }
>;

export type TableApi = {
  /** Cell node factory used each time a cell is created. */
  cellFactory: (options?: CellFactoryOptions) => TTableCellElement;
  getCellChildren: (cell: TTableCellElement) => TDescendant[];
};

export type TableTransforms = {
  insertColumn: OmitFirst<typeof insertTableColumn>;
  insertRow: OmitFirst<typeof insertTableRow>;
};

export type CellFactoryOptions = {
  children?: TDescendant[];
  header?: boolean;
  row?: TTableRowElement;
};

export type TableStoreCellAttributes = WeakMap<
  TTableCellElement,
  { col: number; row: number }
>;

export interface BorderStyle {
  color?: string;
  size?: number;
  // https://docx.js.org/api/enums/BorderStyle.html
  style?: string;
}

export interface TTableElement extends TElement {
  colSizes?: number[];
  marginLeft?: number;
}

export interface TTableRowElement extends TElement {
  size?: number;
}

export interface TTableCellElement extends TElement {
  attributes?: {
    colspan?: string;
    rowspan?: string;
  };
  background?: string;
  borders?: {
    /** Only the last row cells have a bottom border. */
    bottom?: BorderStyle;
    left?: BorderStyle;

    /** Only the last column cells have a right border. */
    right?: BorderStyle;

    top?: BorderStyle;
  };
  colSpan?: number;
  rowSpan?: number;
  size?: number;
}

export type BorderDirection = 'bottom' | 'left' | 'right' | 'top';

export type TableStoreSizeOverrides = Map<number, number>;
