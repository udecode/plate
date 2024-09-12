import type { Location } from 'slate';

import {
  type SlateEditor,
  findNode,
  getAboveNode,
} from '@udecode/plate-common';

import { BaseTablePlugin, BaseTableRowPlugin } from '../BaseTablePlugin';
import { getCellTypes } from '../utils';

/**
 * If at (default = selection) is in table>tr>td|th, return table, row, and cell
 * node entries.
 */
export const getTableEntries = (
  editor: SlateEditor,
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
    match: { type: editor.getType(BaseTableRowPlugin) },
  });

  if (!rowEntry) return;

  const [, rowPath] = rowEntry;

  const tableEntry = getAboveNode(editor, {
    at: rowPath,
    match: { type: editor.getType(BaseTablePlugin) },
  });

  if (!tableEntry) return;

  return {
    cell: cellEntry,
    row: rowEntry,
    table: tableEntry,
  };
};
