import type { TTableCellElement } from '../types';

/**
 * Returns the colspan attribute of the table cell element.
 *
 * @default 1 if undefined.
 */
export const getColSpan = (cellElem: TTableCellElement) => {
  return cellElem.colSpan || Number(cellElem.attributes?.colspan) || 1;
};
