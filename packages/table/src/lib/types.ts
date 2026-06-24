import type { Descendant } from '@platejs/plite';
import type { TTableRowElement } from 'platejs';

export type BorderDirection = 'bottom' | 'left' | 'right' | 'top';

export type CreateCellOptions = {
  children?: Descendant[];
  header?: boolean;
  row?: TTableRowElement;
};

export type TableStoreSizeOverrides = Map<number, number>;
