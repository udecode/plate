import { getPluginOptions, PlateEditor, Value } from '@udecode/plate-common';

import { ELEMENT_TABLE } from '../createTablePlugin';
import { getIndices } from '../merge/getIndices';
import { getIndicesWithSpans } from '../merge/getIndicesWithSpans';
import { TablePlugin, TTableCellElement, TTableElement } from '../types';
import { computeCellIndices } from './computeCellIndices';

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

  const foundCell = allCells.find((cell) => {
    const cellElement = cell as TTableCellElement;

    const indices =
      getIndices(options, cellElement) ||
      computeCellIndices(editor, table, cellElement)!;
    // getIndices(options, cellElement)!;

    const { col: _startColIndex, row: _startRowIndex } = indices;
    const { row: _endRowIndex, col: _endColIndex } = getIndicesWithSpans(
      indices,
      cellElement
    );

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
