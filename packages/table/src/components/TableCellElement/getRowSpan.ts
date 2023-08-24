import { TTableCellElement } from '../../types';

export const getRowSpan = (cellElem: TTableCellElement) => {
  const attrRowSpan = Number(cellElem.attributes?.rowspan);
  return cellElem.rowSpan || attrRowSpan || 1;
};
