import { TTableCellElement } from '../../types';

export const getColSpan = (cellElem: TTableCellElement) => {
  const attrColSpan = Number(cellElem.attributes?.colspan);
  return cellElem.colSpan || attrColSpan || 1;
};
