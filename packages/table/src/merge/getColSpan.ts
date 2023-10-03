import { TTableCellElement } from '../types';

/**
 * Returns the colspan attribute of the table cell element.
 * @default 1 if undefined.
 */
export const getColSpan = (cellElem: TTableCellElement) => {
  const attrColSpan = Number(cellElem.attributes?.colspan);
  return cellElem.colSpan || attrColSpan || 1;
};
