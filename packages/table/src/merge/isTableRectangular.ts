import { TTableCellElement, TTableElement, TTableRowElement } from '../types';

const allEqual = (arr: number[]) => arr.every((val) => val === arr[0]);

/**
 * Checks if the given table is rectangular, meaning all rows have the same effective number of cells, considering colspan and rowspan.
 */
export const isTableRectangular = (table?: TTableElement) => {
  const arr: number[] = [];
  table?.children?.forEach((row, rI) => {
    const rowEl = row as TTableRowElement;

    rowEl.children?.forEach((cell) => {
      const cellElem = cell as TTableCellElement;

      Array.from({
        length: cellElem?.rowSpan || 1,
      } as ArrayLike<number>).forEach((_, i) => {
        if (!arr[rI + i]) {
          arr[rI + i] = 0;
        }
        console.log('current', cellElem?.colSpan || 1);
        arr[rI + i] += cellElem?.colSpan || 1;
      });
    });
  });

  return allEqual(arr);
};
