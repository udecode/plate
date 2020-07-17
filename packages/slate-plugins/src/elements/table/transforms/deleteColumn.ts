import { Editor, Transforms } from 'slate';
import { isNodeTypeIn } from '../../../common/queries';
import { setDefaults } from '../../../common/utils/setDefaults';
import { DEFAULTS_TABLE } from '../defaults';
import { isTable, isTableCell, isTableRow } from '../queries';
import { TableOptions } from '../types';

export const deleteColumn = (editor: Editor, options?: TableOptions) => {
  const { table } = setDefaults(options, DEFAULTS_TABLE);

  if (isNodeTypeIn(editor, table.type)) {
    const currentCellItem = Editor.above(editor, {
      match: isTableCell(options),
    });
    const currentRowItem = Editor.above(editor, {
      match: isTableRow(options),
    });
    const currentTableItem = Editor.above(editor, {
      match: isTable(options),
    });
    if (
      currentCellItem &&
      currentRowItem &&
      currentTableItem &&
      // Cannot delete the last cell
      currentRowItem[0].children.length > 1
    ) {
      const currentCellPath = currentCellItem[1];
      const pathToDelete = currentCellPath.slice();
      const replacePathPos = pathToDelete.length - 2;

      currentTableItem[0].children.forEach((row, rowIdx) => {
        pathToDelete[replacePathPos] = rowIdx;

        Transforms.removeNodes(editor, {
          at: pathToDelete,
        });
      });
    }
  }
};
