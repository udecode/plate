import type {
  BlockInsertOptions,
  ElementEntry,
  NamedRootKey,
  NodeKey,
  NodeSelection,
  NodeTarget,
} from '../../../core';
import type {
  TableCellElement,
  TableElement,
  TableRowElement,
} from './BaseTablePlugin';

export type TableCellBorder = Readonly<{
  color?: string;
  style?: string;
  width?: number;
}>;

export type TableCellBorders = Readonly<{
  /** Only the last row cells have a bottom border. */
  bottom?: TableCellBorder;
  left?: TableCellBorder;
  /** Only the last column cells have a right border. */
  right?: TableCellBorder;
  top?: TableCellBorder;
}>;

export type BorderDirection = 'bottom' | 'left' | 'right' | 'top';

export type TableNodeTarget = NodeTarget<
  TableElement | TableRowElement | TableCellElement
>;

export type TableCellTarget = NodeTarget<TableCellElement>;

export type TableTargetOptions = {
  at?: NodeSelection | TableNodeTarget;
};

export type TableCreateOptions = {
  columns?: number;
  header?: boolean;
  rows?: number;
};

export type TableAxisInsertOptions = TableTargetOptions & {
  before?: boolean;
  header?: boolean;
  select?: boolean;
};

type TableInsertPlacementBase = Omit<BlockInsertOptions, 'after' | 'at'>;

export type TableInsertPlacement =
  | (TableInsertPlacementBase & {
      after?: never;
      at?: BlockInsertOptions['at'];
    })
  | (TableInsertPlacementBase & {
      after: NonNullable<BlockInsertOptions['after']>;
      at?: never;
    });

export type TableSelectionBounds = Readonly<{
  maxCol: number;
  maxRow: number;
  minCol: number;
  minRow: number;
}>;

export type TableSelection = Readonly<{
  anchor: NodeKey;
  bounds: TableSelectionBounds;
  cells: ReadonlyArray<ElementEntry<TableCellElement>>;
  focus: NodeKey;
  rectangular: boolean;
  root?: NamedRootKey;
  table: ElementEntry<TableElement>;
  tableKey: NodeKey;
}>;

export type TableResolvedCellBorder = Readonly<Required<TableCellBorder>>;

export type TableResolvedCellBorders = Readonly<{
  bottom: TableResolvedCellBorder;
  left?: TableResolvedCellBorder;
  right: TableResolvedCellBorder;
  top?: TableResolvedCellBorder;
}>;

export type TableCellInfo = Readonly<{
  borders: TableResolvedCellBorders;
  col: number;
  colSpan: number;
  entry: ElementEntry<TableCellElement>;
  root?: NamedRootKey;
  row: number;
  rowSpan: number;
  size: Readonly<{ minHeight: number; width: number }>;
}>;

export type TableBorderState = boolean | 'mixed';

export type TableBorderStates = Readonly<
  Record<BorderDirection | 'none' | 'outer', TableBorderState>
>;

/** The boundary being resized; row height is measured by the host surface. */
export type TableResizeTarget =
  | { edge: 'bottom'; height: number; rowIndex: number }
  | { edge: 'left' }
  | { colIndex: number; edge: 'right' };

export type TableResize =
  | Readonly<{ edge: 'bottom'; height: number; rowIndex: number }>
  | Readonly<{
      columns: readonly [TableColumnResize, ...TableColumnResize[]];
      edge: 'left';
      marginLeft: number;
    }>
  | Readonly<{
      columns: readonly [TableColumnResize, ...TableColumnResize[]];
      edge: 'right';
    }>;

export type TableColumnResize = Readonly<{
  colIndex: number;
  width: number;
}>;

export type TableResizeOptions = {
  at?: TableNodeTarget;
  resize: TableResize;
};

export type TableColumnWidthOptions = {
  at?: TableNodeTarget;
  colIndex: number;
  width: number;
};

export type TableRowHeightOptions = {
  at?: TableNodeTarget;
  height: number;
  rowIndex: number;
};

export type TableBorderTarget = BorderDirection | 'all' | 'outer';
