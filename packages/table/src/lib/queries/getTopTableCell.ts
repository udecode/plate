import {
  type Path,
  type SlateEditor,
  type TTableCellElement,
  type TTableElement,
  KEYS,
} from 'platejs';

import { getCellTypes, getCellIndices } from '../utils/index';
import { findCellByIndexes } from '../merge/findCellByIndexes';

// Get cell to the top of the current cell
export const getTopTableCell = (
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

  const { row } = indices;

  // If we're at the topmost row, there's no cell above
  if (row === 0) return;

  // Find the cell that actually occupies the position above
  const topCell = findCellByIndexes(editor, table, row - 1, indices.col);
  if (!topCell) return;

  // Get the path of the found cell
  const topCellPath = editor.api.findPath(topCell);
  if (!topCellPath) return;

  return [topCell, topCellPath] as const;
};
