import { Value } from '@udecode/plate-common';

import { TablePlugin, TTableCellElement, TTableElement } from '../types';
import { getIndices } from './getIndices';
import { getIndicesWithSpans } from './getIndicesWithSpans';

export const findCellByIndexes1 = (
  options: TablePlugin<Value>,
  table: TTableElement,
  searchRowIndex: number,
  searchColIndex: number
) => {
  const allCells = table.children.flatMap(
    (current) => current.children
  ) as TTableCellElement[];

  // console.log('searching for', searchRowIndex, searchColIndex);
  const foundCell = allCells.find((cell) => {
    const cellElement = cell as TTableCellElement;

    const { _startColIndex, _startRowIndex } = getIndices(options, cellElement);
    const { _endRowIndex, _endColIndex } = getIndicesWithSpans(
      options,
      cellElement
    );

    // console.log('current', colIndex, endColIndex, rowIndex, endRowIndex);
    if (
      searchColIndex >= _startColIndex &&
      searchColIndex <= _endColIndex &&
      searchRowIndex >= _startRowIndex &&
      searchRowIndex <= _endRowIndex
    ) {
      return true;
    }

    return false;
  });

  return foundCell;
};
