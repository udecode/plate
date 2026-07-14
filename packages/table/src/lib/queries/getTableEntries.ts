import type { BaseEditor } from '@platejs/core';
import type { Location } from '@platejs/plite';
import {
  KEYS,
  type TTableCellElement,
  type TTableElement,
  type TTableRowElement,
} from '@platejs/utils';

import { getCellTypes } from '../utils';

/**
 * If at (default = selection) is in table>tr>td|th, return table, row, and cell
 * node entries.
 */
export const getTableEntries = (
  editor: BaseEditor,
  { at = editor.read.selection() }: { at?: Location | null } = {}
) => {
  if (!at) return;

  const cellEntry = editor.read.nodes.find<TTableCellElement>({
    at,
    match: {
      type: getCellTypes(editor),
    },
  });

  if (!cellEntry) return;

  const [, cellPath] = cellEntry;

  const rowEntry = editor.read.nodes.above<TTableRowElement>({
    at: cellPath,
    match: { type: editor.getType(KEYS.tr) },
  });

  if (!rowEntry) return;

  const [, rowPath] = rowEntry;

  const tableEntry = editor.read.nodes.above<TTableElement>({
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
