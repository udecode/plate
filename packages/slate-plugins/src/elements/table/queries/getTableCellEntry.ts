import { getAbove, getParent, someNode } from '@udecode/slate-plugins-common';
import { SlatePluginsOptions } from '@udecode/slate-plugins-core';
import { Editor, Location } from 'slate';

/**
 * If at (default = selection) is in table>tr>td, return table, tr, and td
 * node entries.
 */
export const getTableCellEntry = (
  editor: Editor,
  { at = editor.selection }: { at?: Location | null } = {},
  options: SlatePluginsOptions
) => {
  const { td, tr, table } = options;

  if (at && someNode(editor, { at, match: { type: td.type } })) {
    const selectionParent = getParent(editor, at);
    if (!selectionParent) return;
    const [, paragraphPath] = selectionParent;

    const tableCell =
      getAbove(editor, { at, match: { type: td.type } }) ||
      getParent(editor, paragraphPath);

    if (!tableCell) return;
    const [tableCellNode, tableCellPath] = tableCell;

    if (tableCellNode.type !== td.type) return;

    const tableRow = getParent(editor, tableCellPath);
    if (!tableRow) return;
    const [tableRowNode, tableRowPath] = tableRow;

    if (tableRowNode.type !== tr.type) return;

    const tableElement = getParent(editor, tableRowPath);
    if (!table) return;

    return {
      tableElement,
      tableRow,
      tableCell,
    };
  }
};
