import { getAbove, getParent, someNode } from '@udecode/slate-plugins-common';
import { getSlatePluginType, SPEditor } from '@udecode/slate-plugins-core';
import { Location } from 'slate';
import { ELEMENT_TD, ELEMENT_TR } from '../defaults';

/**
 * If at (default = selection) is in table>tr>td, return table, tr, and td
 * node entries.
 */
export const getTableCellEntry = (
  editor: SPEditor,
  { at = editor.selection }: { at?: Location | null } = {}
) => {
  if (
    at &&
    someNode(editor, {
      at,
      match: { type: getSlatePluginType(editor, ELEMENT_TD) },
    })
  ) {
    const selectionParent = getParent(editor, at);
    if (!selectionParent) return;
    const [, paragraphPath] = selectionParent;

    const tableCell =
      getAbove(editor, {
        at,
        match: { type: getSlatePluginType(editor, ELEMENT_TD) },
      }) || getParent(editor, paragraphPath);

    if (!tableCell) return;
    const [tableCellNode, tableCellPath] = tableCell;

    if (tableCellNode.type !== getSlatePluginType(editor, ELEMENT_TD)) return;

    const tableRow = getParent(editor, tableCellPath);
    if (!tableRow) return;
    const [tableRowNode, tableRowPath] = tableRow;

    if (tableRowNode.type !== getSlatePluginType(editor, ELEMENT_TR)) return;

    const tableElement = getParent(editor, tableRowPath);
    if (!tableElement) return;

    return {
      tableElement,
      tableRow,
      tableCell,
    };
  }
};
