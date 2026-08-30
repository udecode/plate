import type { ElementWith } from '../../../../core';
import type {
  TableElement,
  TableRowElement,
  BaseTableCellPlugin,
} from '../BaseTablePlugin';

export type TableCellElementWithId<TType extends string = 'tableCell'> =
  ElementWith<typeof BaseTableCellPlugin> &
    Readonly<{ id: string }> &
    Readonly<{ type: TType }>;
export type TableElementWithId = TableElement & Readonly<{ id: string }>;
export type TableRowElementWithId = TableRowElement & Readonly<{ id: string }>;
