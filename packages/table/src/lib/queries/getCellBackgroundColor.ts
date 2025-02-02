import type { TTableCellElement } from '../types';

/**
 * Returns the backgroundColor attribute of the table cell element.
 *
 * @default '' if undefined
 */
export const getCellBackgroundColor = (cellElem: TTableCellElement) => {
  return cellElem.backgroundColor || '';
};
