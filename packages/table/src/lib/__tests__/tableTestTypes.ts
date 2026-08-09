import type { ElementWith } from '@platejs/core';

import type { TableElement, TableRowElement } from '../BaseTablePlugin';
import type { BaseTableCellPlugin } from '../BaseTablePlugin';

export type TableCellElementWithId<TType extends string = 'tableCell'> =
  ElementWith<typeof BaseTableCellPlugin> &
    Readonly<{ id: string }> &
    Readonly<{ type: TType }>;
export type TableElementWithId = TableElement & Readonly<{ id: string }>;
export type TableRowElementWithId = TableRowElement & Readonly<{ id: string }>;
