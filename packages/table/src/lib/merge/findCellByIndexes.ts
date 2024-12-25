import type { SlateEditor } from '@udecode/plate-common';

import type { TTableCellElement, TTableElement } from '../types';

import { getCellIndices } from '../utils/getCellIndices';
import { getCellIndicesWithSpans } from './getCellIndicesWithSpans';

export const findCellByIndexes = (
  editor: SlateEditor,
  table: TTableElement,
  searchRowIndex: number,
  searchColIndex: number
) => {
  const allCells = table.children.flatMap(
    (current) => current.children
  ) as TTableCellElement[];

  const foundCell = allCells.find((cell) => {
    const cellElement = cell as TTableCellElement;

    const indices = getCellIndices(editor, {
      cellNode: cellElement,
      tableNode: table,
    });

    const { col: _startColIndex, row: _startRowIndex } = indices;
    const { col: _endColIndex, row: _endRowIndex } = getCellIndicesWithSpans(
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
