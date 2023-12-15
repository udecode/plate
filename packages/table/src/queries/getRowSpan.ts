import { TTableCellElement } from '../types';

/**
 * Returns the rowspan attribute of the table cell element.
 * @default 1 if undefined
 */
export const getRowSpan = (cellElem: TTableCellElement) => {
  return cellElem.rowSpan || Number(cellElem.attributes?.rowspan) || 1;
};
