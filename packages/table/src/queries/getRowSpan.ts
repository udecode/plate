import { TTableCellElement } from '../types';

/**
 * Returns the rowspan attribute of the table cell element.
 * @default 1 if undefined
 */
export const getRowSpan = (cellElem: TTableCellElement) => {
  const attrRowSpan = Number(cellElem.attributes?.rowspan);
  return cellElem.rowSpan || attrRowSpan || 1;
};
