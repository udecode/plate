import type {
  EditorNodesOptions,
  Element,
  NodeTarget,
  Path,
  Span,
} from '../../../core';
import type {
  TableCellBorder,
  TableCellElement,
  TableRowElement,
} from './BaseTablePlugin';

export type { TableContext } from './internal/context';
export type {
  TableGrid,
  TableGridAnchor,
  TableGridCompilerMetrics,
  TableGridProblem,
} from './internal/grid';
export type {
  TableSelectionBounds,
  TableSelectionEdge,
  TableSelectionExpansion,
  TableSelectionNeighborDirection,
  TableSelectionView,
  TableSelectionViewMetrics,
} from './internal/selection';

export type BorderDirection = 'bottom' | 'left' | 'right' | 'top';

export type CreateCellOptions = {
  children?: TableCellElement['children'];
  header?: boolean;
  row?: TableRowElement;
};

export type GetEmptyRowNodeOptions = CreateCellOptions & {
  colCount?: number;
};

export type GetEmptyTableNodeOptions = GetEmptyRowNodeOptions & {
  rowCount?: number;
};

export type CellIndices = {
  col: number;
  row: number;
};

export type BorderStylesDefault = {
  bottom: TableCellBorder;
  right: TableCellBorder;
  left?: TableCellBorder;
  top?: TableCellBorder;
};

export type SetBorderWidthOptions = {
  at?: Path;
  border?: BorderDirection | 'all';
  width: number;
};

export type TableBorderStates = {
  bottom: boolean;
  left: boolean;
  none: boolean;
  outer: boolean;
  right: boolean;
  top: boolean;
};

export type TableStoreSizeOverrides = Map<number, number>;

/** The boundary being resized; row height is measured by the host surface. */
export type TableResizeTarget =
  | { edge: 'bottom'; height: number; rowIndex: number }
  | { edge: 'left' }
  | { colIndex: number; edge: 'right' };

/** A constrained resize preview that can be committed with `update.resize`. */
export type TableResize =
  | { edge: 'bottom'; height: number; rowIndex: number }
  | {
      columns: ReadonlyArray<{ colIndex: number; width: number }>;
      edge: 'left' | 'right';
      marginLeft?: number;
    };

export type TableFindOptions = Omit<
  EditorNodesOptions<Element>,
  'at' | 'match' | 'type'
> & {
  at?: NodeTarget | Span;
};
