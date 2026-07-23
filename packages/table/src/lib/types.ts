import type {
  Descendant,
  EditorNodesOptions,
  NodeTarget,
  Path,
  Span,
} from '@platejs/plite';
import type {
  TTableCellBorder,
  TTableElement,
  TTableRowElement,
} from '@platejs/utils';

export type BorderDirection = 'bottom' | 'left' | 'right' | 'top';

export type CreateCellOptions = {
  children?: Descendant[];
  header?: boolean;
  row?: TTableRowElement;
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
  bottom: TTableCellBorder;
  right: TTableCellBorder;
  left?: TTableCellBorder;
  top?: TTableCellBorder;
};

export type SetBorderSizeOptions = {
  at?: Path;
  border?: BorderDirection | 'all';
  size: number;
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
  EditorNodesOptions<TTableElement>,
  'at' | 'match'
> & {
  at?: NodeTarget<TTableElement> | Span;
};
