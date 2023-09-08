import {
  TTableCellElement,
  TTableElement,
  TTableRowElement,
} from '../../types';

const allEqual = (arr: number[]) => arr.every((val) => val === arr[0]);

export const isTableRectangular = (table?: TTableElement) => {
  const arr: number[] = [];
  table?.children?.forEach((row, rI) => {
    const rowEl = row as TTableRowElement;

    rowEl.children?.forEach((cell) => {
      const cellElem = cell as TTableCellElement;

      //   console.log('current cell', cellElem);
      Array.from({
        length: cellElem?.rowSpan || 1,
      } as ArrayLike<number>).forEach((_, i) => {
        // console.log(
        //   'pushing into arr, index',
        //   rI + i,
        //   'value',
        //   cellElem?.colSpan || 1
        // );
        if (!arr[rI + i]) {
          arr[rI + i] = 0;
        }
        arr[rI + i] += cellElem?.colSpan || 1;
      });
    });
  });

  //   console.log('arr', arr);

  return allEqual(arr);
};
