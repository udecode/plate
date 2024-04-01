import { TNodeEntry } from '@udecode/plate-common';

import { TTableCellElement } from '../types';
import { getCellRowIndexByPath } from '../utils/getCellRowIndexByPath';

export const getSelectionWidth = (cells: TNodeEntry<TTableCellElement>[]) => {
  // default = firstRowIndex

  let max = 0;
  let lastCellRowIndex = getCellRowIndexByPath(cells[0][1]);
  let total = 0;
  cells.forEach(([cell, cellPath]) => {
    const currentCellRowIndex = getCellRowIndexByPath(cellPath);
    //  on the same line
    if (currentCellRowIndex === lastCellRowIndex) {
      total += cell.colSpan ?? 1;
    } else {
      max = Math.max(total, max);
      total = 0;
    }
    lastCellRowIndex = currentCellRowIndex;
  });
  return Math.max(total, max);
};
