import {
  getAbove,
  getParent,
  getPluginType,
  PlateEditor,
  someNode,
} from '@udecode/plate-core';
import { Location } from 'slate';
import { ELEMENT_TD, ELEMENT_TH, ELEMENT_TR } from '../createTablePlugin';

/**
 * If at (default = selection) is in table>tr>td or table>tr>th,
 * return table, tr, and td or th node entries.
 */
export const getTableCellEntry = <T = {}>(
  editor: PlateEditor<T>,
  { at = editor.selection }: { at?: Location | null } = {}
) => {
  if (
    at &&
    someNode(editor, {
      at,
      match: {
        type: [
          getPluginType(editor, ELEMENT_TD),
          getPluginType(editor, ELEMENT_TH),
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
            getPluginType(editor, ELEMENT_TD),
            getPluginType(editor, ELEMENT_TH),
          ],
        },
      }) || getParent(editor, paragraphPath);

    if (!tableCell) return;
    const [tableCellNode, tableCellPath] = tableCell;

    if (
      tableCellNode.type !== getPluginType(editor, ELEMENT_TD) &&
      tableCellNode.type !== getPluginType(editor, ELEMENT_TH)
    )
      return;

    const tableRow = getParent(editor, tableCellPath);
    if (!tableRow) return;
    const [tableRowNode, tableRowPath] = tableRow;

    if (tableRowNode.type !== getPluginType(editor, ELEMENT_TR)) return;

    const tableElement = getParent(editor, tableRowPath);
    if (!tableElement) return;

    return {
      tableElement,
      tableRow,
      tableCell,
    };
  }
};
