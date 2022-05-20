import { getNode, TEditor, TElement, Value } from '@udecode/plate-core';
import { Range } from 'slate';

/**
 * Get cells between 2 cell paths as a grid.
 */
export const getGridCellsByRange = <V extends Value>(
  editor: TEditor<V>,
  cellRange: Range
) => {
  const startCellPath = cellRange.anchor.path;
  const endCellPath = cellRange.focus.path;

  const _startRowIndex = startCellPath[startCellPath.length - 2];
  const _endRowIndex = endCellPath[endCellPath.length - 2];
  const _startColIndex = startCellPath[startCellPath.length - 1];
  const _endColIndex = endCellPath[endCellPath.length - 1];

  const startRowIndex = Math.min(_startRowIndex, _endRowIndex);
  const endRowIndex = Math.max(_startRowIndex, _endRowIndex);
  const startColIndex = Math.min(_startColIndex, _endColIndex);
  const endColIndex = Math.max(_startColIndex, _endColIndex);

  const tablePath = startCellPath.slice(0, -2);

  const cells: TElement[] = [];

  let rowIndex = startRowIndex;
  let colIndex = startColIndex;

  while (true) {
    const cell = getNode<TElement>(
      editor,
      tablePath.concat([rowIndex, colIndex])
    );
    if (!cell) break;

    cells.push(cell);

    if (colIndex + 1 <= endColIndex) {
      colIndex += 1;
    } else if (rowIndex + 1 <= endRowIndex) {
      colIndex = startColIndex;
      rowIndex += 1;
    } else {
      break;
    }
  }

  return cells;
};
