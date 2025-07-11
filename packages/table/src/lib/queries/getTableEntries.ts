import { type SlateEditor, type TLocation, KEYS } from 'platejs';

import { getCellTypes } from '../utils';

/**
 * If at (default = selection) is in table>tr>td|th, return table, row, and cell
 * node entries.
 */
export const getTableEntries = (
  editor: SlateEditor,
  { at = editor.selection }: { at?: TLocation | null } = {}
) => {
  if (!at) return;

  const cellEntry = editor.api.node({
    at,
    match: {
      type: getCellTypes(editor),
    },
  });

  if (!cellEntry) return;

  const [, cellPath] = cellEntry;

  const rowEntry = editor.api.above({
    at: cellPath,
    match: { type: editor.getType(KEYS.tr) },
  });

  if (!rowEntry) return;

  const [, rowPath] = rowEntry;

  const tableEntry = editor.api.above({
    at: rowPath,
    match: { type: editor.getType(KEYS.table) },
  });

  if (!tableEntry) return;

  return {
    cell: cellEntry,
    row: rowEntry,
    table: tableEntry,
  };
};
