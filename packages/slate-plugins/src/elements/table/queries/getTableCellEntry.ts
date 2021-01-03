import { Editor, Location } from 'slate';
import { setDefaults } from '../../../common';
import { getAboveByType } from '../../../common/queries/getAboveByType';
import { getParent } from '../../../common/queries/getParent';
import { isNodeTypeIn } from '../../../common/queries/isNodeTypeIn';
import { DEFAULTS_TABLE } from '../defaults';
import { TableOptions } from '../types';

/**
 * If at (default = selection) is in table>tr>td, return table, tr, and td
 * node entries.
 */
export const getTableCellEntry = (
  editor: Editor,
  { at = editor.selection }: { at?: Location | null } = {},
  options?: TableOptions
) => {
  const { td, tr, table } = setDefaults(options, DEFAULTS_TABLE);

  if (at && isNodeTypeIn(editor, td.type, { at })) {
    const selectionParent = getParent(editor, at);
    if (!selectionParent) return;
    const [, paragraphPath] = selectionParent;

    const tableCell =
      getAboveByType(editor, td.type, { at }) ||
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
