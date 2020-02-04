import { Editor, Transforms } from 'slate';
import { isSelectionInTable, isTable, isTableCell } from '../queries';

export const deleteColumn = (editor: Editor) => {
  if (isSelectionInTable(editor)) {
    const currentCellItem = Editor.above(editor, {
      match: isTableCell,
    });
    const currentTableItem = Editor.above(editor, {
      match: isTable,
    });
    if (currentCellItem && currentTableItem) {
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
