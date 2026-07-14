import type {
  Descendant,
  EditorNodesOptions,
  NodeTarget,
  Span,
} from '@platejs/plite';
import type { TTableElement, TTableRowElement } from '@platejs/utils';

export type BorderDirection = 'bottom' | 'left' | 'right' | 'top';

export type CreateCellOptions = {
  children?: Descendant[];
  header?: boolean;
  row?: TTableRowElement;
};

export type TableStoreSizeOverrides = Map<number, number>;

export type TableFindOptions = Omit<
  EditorNodesOptions<TTableElement>,
  'at' | 'match'
> & {
  at?: NodeTarget<TTableElement> | Span;
};
