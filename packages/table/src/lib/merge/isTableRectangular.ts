import type {
  TTableCellElement,
  TTableElement,
  TTableRowElement,
} from '../types';

import { getColSpan } from '../queries';
import { getRowSpan } from '../queries/getRowSpan';

const allEqual = (arr: number[]) => arr.every((val) => val === arr[0]);

/**
 * Checks if the given table is rectangular, meaning all rows have the same
 * effective number of cells, considering colspan and rowspan.
 */
export const isTableRectangular = (table?: TTableElement) => {
  const arr: number[] = [];
  table?.children?.forEach((row, rI) => {
    const rowEl = row as TTableRowElement;

    rowEl.children?.forEach((cell) => {
      const cellElem = cell as TTableCellElement;

      Array.from({
        length: getRowSpan(cellElem) || 1,
      } as ArrayLike<number>).forEach((_, i) => {
        if (!arr[rI + i]) {
          arr[rI + i] = 0;
        }

        arr[rI + i] += getColSpan(cellElem);
      });
    });
  });

  return allEqual(arr);
};
