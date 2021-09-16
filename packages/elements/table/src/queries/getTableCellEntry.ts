import { getAbove, getParent, someNode } from '@udecode/plate-common';
import { getPlatePluginType, SPEditor } from '@udecode/plate-core';
import { Location } from 'slate';
import { ELEMENT_TD, ELEMENT_TH, ELEMENT_TR } from '../defaults';

/**
 * If at (default = selection) is in table>tr>td or table>tr>th,
 * return table, tr, and td or th node entries.
 */
export const getTableCellEntry = (
  editor: SPEditor,
  { at = editor.selection }: { at?: Location | null } = {}
) => {
  if (
    at &&
    someNode(editor, {
      at,
      match: {
        type: [
          getPlatePluginType(editor, ELEMENT_TD),
          getPlatePluginType(editor, ELEMENT_TH),
        ],
      },
    })
  ) {
    const selectionParent = getParent(editor, at);
    if (!selectionParent) return;
    const [, paragraphPath] = selectionParent;

    const tableCell =
      getAbove(editor, {
        at,
        match: {
          type: [
            getPlatePluginType(editor, ELEMENT_TD),
            getPlatePluginType(editor, ELEMENT_TH),
          ],
        },
      }) || getParent(editor, paragraphPath);

    if (!tableCell) return;
    const [tableCellNode, tableCellPath] = tableCell;

    if (
      tableCellNode.type !== getPlatePluginType(editor, ELEMENT_TD) &&
      tableCellNode.type !== getPlatePluginType(editor, ELEMENT_TH)
    )
      return;

    const tableRow = getParent(editor, tableCellPath);
    if (!tableRow) return;
    const [tableRowNode, tableRowPath] = tableRow;

    if (tableRowNode.type !== getPlatePluginType(editor, ELEMENT_TR)) return;

    const tableElement = getParent(editor, tableRowPath);
    if (!tableElement) return;

    return {
      tableElement,
      tableRow,
      tableCell,
    };
  }
};
