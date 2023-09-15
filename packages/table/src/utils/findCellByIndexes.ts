import { TTableCellElement, TTableElement } from '../types';

export const findCellByIndexes = (
  table: TTableElement,
  searchRowIndex: number,
  searchColIndex: number
) => {
  const allCells = table.children.flatMap(
    (current) => current.children
  ) as TTableCellElement[];

  const foundCell = allCells.find((cell) => {
    const cellElement = cell as TTableCellElement;

    const colIndex = cellElement.colIndex!;
    const endColIndex = cellElement.colIndex! + cellElement.colSpan! - 1;
    const rowIndex = cellElement.rowIndex!;
    const endRowIndex = cellElement.rowIndex! + cellElement.rowSpan! - 1;

    if (
      searchColIndex >= colIndex &&
      searchColIndex <= endColIndex &&
      searchRowIndex >= rowIndex &&
      searchRowIndex <= endRowIndex
    ) {
      return true;
    }

    return false;
  });

  return foundCell;
};
