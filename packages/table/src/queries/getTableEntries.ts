import type { Location } from 'slate';

import {
  type PlateEditor,
  findNode,
  getAboveNode,
  getPluginType,
} from '@udecode/plate-common';

import { TablePlugin, TableRowPlugin } from '../TablePlugin';
import { getCellTypes } from '../utils/index';

/**
 * If at (default = selection) is in table>tr>td|th, return table, row, and cell
 * node entries.
 */
export const getTableEntries = (
  editor: PlateEditor,
  { at = editor.selection }: { at?: Location | null } = {}
) => {
  if (!at) return;

  const cellEntry = findNode(editor, {
    at,
    match: {
      type: getCellTypes(editor),
    },
  });

  if (!cellEntry) return;

  const [, cellPath] = cellEntry;

  const rowEntry = getAboveNode(editor, {
    at: cellPath,
    match: { type: editor.getType(TableRowPlugin) },
  });

  if (!rowEntry) return;

  const [, rowPath] = rowEntry;

  const tableEntry = getAboveNode(editor, {
    at: rowPath,
    match: { type: editor.getType(TablePlugin) },
  });

  if (!tableEntry) return;

  return {
    cell: cellEntry,
    row: rowEntry,
    table: tableEntry,
  };
};
