import { Editor, Transforms } from 'slate';
import { isSelectionInTable, isTable, isTableRow } from '../queries';

export const deleteRow = (editor: Editor) => {
  if (isSelectionInTable(editor)) {
    const currentTableItem = Editor.above(editor, {
      match: isTable,
    });
    const currentRowItem = Editor.above(editor, {
      match: isTableRow,
    });
    if (
      currentRowItem &&
      currentTableItem &&
      // Cannot delete the last row
      currentTableItem[0].children.length > 1
    ) {
      Transforms.removeNodes(editor, {
        at: currentRowItem[1],
      });
    }
  }
};
