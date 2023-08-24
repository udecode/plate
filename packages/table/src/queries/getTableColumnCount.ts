import { TElement } from '@udecode/plate-common';

import { TTableCellElement } from '../types';

export const getTableColumnCount = (tableNode: TElement) => {
  const firstRow = (tableNode.children as TElement[])?.[0];
  const colCount = firstRow?.children.reduce((acc, current) => {
    let next = acc + 1;

    const cellElement = current as TTableCellElement;
    const attrColSpan = Number(cellElement.attributes?.colspan);
    const colSpan = cellElement.colSpan || attrColSpan;
    if (colSpan && colSpan > 1) {
      next += colSpan - 1;
    }

    return next;
  }, 0);
  return colCount;
};
