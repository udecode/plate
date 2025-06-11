import type { Descendant, TTableRowElement } from '@udecode/plate';

export type BorderDirection = 'bottom' | 'left' | 'right' | 'top';

export type CreateCellOptions = {
  children?: Descendant[];
  header?: boolean;
  row?: TTableRowElement;
};

export type TableStoreSizeOverrides = Map<number, number>;
