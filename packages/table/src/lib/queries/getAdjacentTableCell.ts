import type {
  NodeEntry,
  Path,
  SlateEditor,
  TTableCellElement,
  TTableElement,
} from 'platejs';

import { findCellByIndexes } from '../merge/findCellByIndexes';
import { getCellPath } from '../merge/getCellPath';
import { getCellIndices } from '../utils/getCellIndices';
import { getTableEntries } from './getTableEntries';

export const getAdjacentTableCell = (
  editor: SlateEditor,
  {
    at,
    deltaCol = 0,
    deltaRow = 0,
  }: {
    at?: Path;
    deltaCol?: number;
    deltaRow?: number;
  } = {}
) => {
  const entries = getTableEntries(editor, { at });

  if (!entries) return;

  const [cell] = entries.cell as NodeEntry<TTableCellElement>;
  const tableEntry = entries.table as NodeEntry<TTableElement>;
  const [table] = tableEntry;
  const { col, row } = getCellIndices(editor, cell);

  const nextCol = col + deltaCol;
  const nextRow = row + deltaRow;

  if (nextCol < 0 || nextRow < 0) return;

  const adjacentCell = findCellByIndexes(editor, table, nextRow, nextCol);

  if (!adjacentCell) return;

  const { col: adjacentCol, row: adjacentRow } = getCellIndices(
    editor,
    adjacentCell
  );
  const adjacentPath = getCellPath(
    editor,
    tableEntry,
    adjacentRow,
    adjacentCol
  );

  return [adjacentCell, adjacentPath] as const;
};
