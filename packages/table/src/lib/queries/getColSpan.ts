import type { TTableCellElement } from 'platejs';

/**
 * Returns the colspan attribute of the table cell element.
 *
 * @default 1 if undefined.
 */
export const getColSpan = (cellElem: TTableCellElement) =>
  cellElem.colSpan || Number(cellElem.attributes?.colspan) || 1;
