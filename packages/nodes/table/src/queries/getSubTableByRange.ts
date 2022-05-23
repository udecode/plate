import { getNode, PlateEditor, TElement, Value } from '@udecode/plate-core';
import { Range } from 'slate';
import { TTableElement } from '../types';
import { getEmptyTableNode } from '../utils/getEmptyTableNode';

export interface GetSubTableByRangeOptions {
  at: Range;

  /**
   * Format of the output:
   * - table element
   * - array of cells
   */
  format?: 'table' | 'cell';
}

/**
 * Get sub table between 2 cell paths.
 */
export const getSubTableByRange = <V extends Value>(
  editor: PlateEditor<V>,
  { at, format = 'table' }: GetSubTableByRangeOptions
) => {
  const startCellPath = at.anchor.path;
  const endCellPath = at.focus.path;

  const _startRowIndex = startCellPath[startCellPath.length - 2];
  const _endRowIndex = endCellPath[endCellPath.length - 2];
  const _startColIndex = startCellPath[startCellPath.length - 1];
  const _endColIndex = endCellPath[endCellPath.length - 1];

  const startRowIndex = Math.min(_startRowIndex, _endRowIndex);
  const endRowIndex = Math.max(_startRowIndex, _endRowIndex);
  const startColIndex = Math.min(_startColIndex, _endColIndex);
  const endColIndex = Math.max(_startColIndex, _endColIndex);

  const tablePath = startCellPath.slice(0, -2);

  const relativeRowIndex = endRowIndex - startRowIndex;
  const relativeColIndex = endColIndex - startColIndex;

  const table: TTableElement = getEmptyTableNode(editor, {
    rowCount: relativeRowIndex + 1,
    colCount: relativeColIndex + 1,
    cellChildren: [],
  });

  let rowIndex = startRowIndex;
  let colIndex = startColIndex;

  while (true) {
    const cell = getNode<TElement>(
      editor,
      tablePath.concat([rowIndex, colIndex])
    );
    if (!cell) break;

    const rows = table.children[rowIndex - startRowIndex]
      .children as TElement[];

    rows[colIndex - startColIndex] = cell;

    if (colIndex + 1 <= endColIndex) {
      colIndex += 1;
    } else if (rowIndex + 1 <= endRowIndex) {
      colIndex = startColIndex;
      rowIndex += 1;
    } else {
      break;
    }
  }

  if (format === 'cell') {
    const cells: TElement[] = [];

    table.children.forEach((row) => {
      cells.push(...(row.children as TElement[]));
    });

    return cells;
  }

  return table;
};
