import type {
  EditorNodesOptions,
  Element,
  NodeTarget,
  Path,
  Span,
} from '@platejs/plite';

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

export type TableFindOptions = Omit<
  EditorNodesOptions<Element>,
  'at' | 'match' | 'type'
> & {
  at?: NodeTarget | Span;
};
