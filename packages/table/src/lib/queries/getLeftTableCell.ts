import type { Path, SlateEditor, TTableCellElement, TTableElement } from 'platejs';

import { KEYS } from 'platejs';

import { getCellTypes, getCellIndices } from '../utils';
import { findCellByIndexes } from '../merge/findCellByIndexes';

// Get cell to the left of the current cell
export const getLeftTableCell = (
  editor: SlateEditor,
  {
    at: cellPath,
  }: {
    at?: Path;
  } = {}
) => {
  if (!cellPath) {
    cellPath = editor.api.node<TTableCellElement>({
      match: { type: getCellTypes(editor) },
    })?.[1];

    if (!cellPath) return;
  }

  // Get the current cell
  const cellEntry = editor.api.node<TTableCellElement>(cellPath);
  if (!cellEntry) return;

  const [cell] = cellEntry;

  // Get the table
  const tableEntry = editor.api.above<TTableElement>({
    at: cellPath,
    match: { type: editor.getType(KEYS.table) },
  });

  if (!tableEntry) return;

  const [table] = tableEntry;

  // Get cell indices
  const indices = getCellIndices(editor, cell);
  if (!indices) return;

  const { col } = indices;

  // If we're at the leftmost column, there's no cell to the left
  if (col === 0) return;

  // Find the cell that actually occupies the position to the left
  const leftCell = findCellByIndexes(editor, table, indices.row, col - 1);
  if (!leftCell) return;

  // Get the path of the found cell
  const leftCellPath = editor.api.findPath(leftCell);
  if (!leftCellPath) return;

  return [leftCell, leftCellPath] as const;
};
