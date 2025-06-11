import type { Descendant, TTableRowElement } from 'platejs';

export type BorderDirection = 'bottom' | 'left' | 'right' | 'top';

export type CreateCellOptions = {
  children?: Descendant[];
  header?: boolean;
  row?: TTableRowElement;
};

export type TableStoreSizeOverrides = Map<number, number>;
