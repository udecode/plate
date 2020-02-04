import { Editor, Transforms } from 'slate';
import { isSelectionInTable, isTableRow } from '../queries';

export const deleteRow = (editor: Editor) => {
  if (isSelectionInTable(editor)) {
    const currentRowItem = Editor.above(editor, {
      match: isTableRow,
    });
    if (currentRowItem) {
      Transforms.removeNodes(editor, {
        at: currentRowItem[1],
      });
    }
  }
};
