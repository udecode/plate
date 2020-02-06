import { Editor, Transforms } from 'slate';
import {
  isSelectionInTable,
  isTable,
  isTableCell,
  isTableRow,
} from '../queries';

export const deleteColumn = (editor: Editor) => {
  if (isSelectionInTable(editor)) {
    const currentCellItem = Editor.above(editor, {
      match: isTableCell,
    });
    const currentRowItem = Editor.above(editor, {
      match: isTableRow,
    });
    const currentTableItem = Editor.above(editor, {
      match: isTable,
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
