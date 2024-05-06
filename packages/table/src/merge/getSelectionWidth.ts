import type { Path } from 'slate';

import type { TTableCellElement } from '../types';

import { getCellRowIndexByPath } from '../utils/getCellRowIndexByPath';

export const getSelectionWidth = <T extends [TTableCellElement, Path]>(
  cells: T[]
) => {
  // default = firstRowIndex

  let max = 0;
  let lastCellRowIndex = getCellRowIndexByPath(cells[0][1]);
  let total = 0;
  cells.forEach(([cell, cellPath]) => {
    const currentCellRowIndex = getCellRowIndexByPath(cellPath);

    //  on the same line
    if (currentCellRowIndex === lastCellRowIndex) {
      const colSpan = cell.colSpan ?? cell.attributes?.colspan;
      const colSpanNumbered = colSpan ? Number(colSpan) : 1;
      total += colSpanNumbered;
    } else {
      max = Math.max(total, max);
      // easy to error
      total = 0;
    }

    lastCellRowIndex = currentCellRowIndex;
  });

  return Math.max(total, max);
};
