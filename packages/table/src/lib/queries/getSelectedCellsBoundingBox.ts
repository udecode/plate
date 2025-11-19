import type { SlateEditor, TTableCellElement } from 'platejs';

import { getCellIndices } from '../utils';
import { getColSpan } from './getColSpan';
import { getRowSpan } from './getRowSpan';

/** Return bounding box [minRow..maxRow, minCol..maxCol] of all selected cells. */
export function getSelectedCellsBoundingBox(
  editor: SlateEditor,
  cells: TTableCellElement[]
): { maxCol: number; maxRow: number; minCol: number; minRow: number } {
  let minRow = Number.POSITIVE_INFINITY;
  let maxRow = Number.NEGATIVE_INFINITY;
  let minCol = Number.POSITIVE_INFINITY;
  let maxCol = Number.NEGATIVE_INFINITY;

  for (const cell of cells) {
    const { col, row } = getCellIndices(editor, cell);
    const cSpan = getColSpan(cell);
    const rSpan = getRowSpan(cell);
    const endRow = row + rSpan - 1;
    const endCol = col + cSpan - 1;

    if (row < minRow) minRow = row;
    if (endRow > maxRow) maxRow = endRow;
    if (col < minCol) minCol = col;
    if (endCol > maxCol) maxCol = endCol;
  }

  return { maxCol, maxRow, minCol, minRow };
}
