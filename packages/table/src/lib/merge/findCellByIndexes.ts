import type { SlateEditor } from '@udecode/plate';

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

  const foundCell = allCells.find((cellNode) => {
    const indices = getCellIndices(editor, cellNode);

    const { col: _startColIndex, row: _startRowIndex } = indices;
    const { col: _endColIndex, row: _endRowIndex } = getCellIndicesWithSpans(
      indices,
      cellNode
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
