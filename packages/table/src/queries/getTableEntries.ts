import type { Location } from 'slate';

import {
  type PlateEditor,
  type Value,
  findNode,
  getAboveNode,
  getPluginType,
} from '@udecode/plate-common/server';

import { ELEMENT_TABLE, ELEMENT_TR } from '../createTablePlugin';
import { getCellTypes } from '../utils/index';

/**
 * If at (default = selection) is in table>tr>td|th, return table, row, and cell
 * node entries.
 */
export const getTableEntries = <V extends Value>(
  editor: PlateEditor<V>,
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
    match: { type: getPluginType(editor, ELEMENT_TR) },
  });

  if (!rowEntry) return;

  const [, rowPath] = rowEntry;

  const tableEntry = getAboveNode(editor, {
    at: rowPath,
    match: { type: getPluginType(editor, ELEMENT_TABLE) },
  });

  if (!tableEntry) return;

  return {
    cell: cellEntry,
    row: rowEntry,
    table: tableEntry,
  };
};
