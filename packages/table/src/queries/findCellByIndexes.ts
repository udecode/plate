import { getPluginOptions, PlateEditor, Value } from '@udecode/plate-common';

import { ELEMENT_TABLE } from '../createTablePlugin';
import { TablePlugin, TTableCellElement, TTableElement } from '../types';
import { computeCellIndices } from './computeCellIndices';
import { getIndices } from './getIndices';
import { getIndicesWithSpans } from './getIndicesWithSpans';

export const findCellByIndexes = <V extends Value>(
  editor: PlateEditor<V>,
  table: TTableElement,
  searchRowIndex: number,
  searchColIndex: number
) => {
  const options = getPluginOptions<TablePlugin, V>(editor, ELEMENT_TABLE);

  const allCells = table.children.flatMap(
    (current) => current.children
  ) as TTableCellElement[];

  // console.log('searching for', searchRowIndex, searchColIndex);
  const foundCell = allCells.find((cell) => {
    const cellElement = cell as TTableCellElement;

    const indices =
      getIndices(options, cellElement) ||
      computeCellIndices(editor, table, cellElement)!;

    const { col: _startColIndex, row: _startRowIndex } = indices;
    const { row: _endRowIndex, col: _endColIndex } = getIndicesWithSpans(
      indices,
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
