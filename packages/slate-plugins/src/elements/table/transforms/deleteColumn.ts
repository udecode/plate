import { Editor, Transforms } from 'slate';
import { isNodeInSelection } from '../../../common/queries';
import { isTable, isTableCell, isTableRow } from '../queries';
import { defaultTableTypes } from '../types';

export const deleteColumn = (editor: Editor, options = defaultTableTypes) => {
  if (isNodeInSelection(editor, options.typeTable)) {
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
