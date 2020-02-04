import { Editor, Transforms } from 'slate';
import { isSelectionInTable, isTable } from '../queries';

export const deleteTable = (editor: Editor) => {
  if (isSelectionInTable(editor)) {
    const tableItem = Editor.above(editor, {
      match: isTable,
    });
    if (tableItem) {
      Transforms.removeNodes(editor, {
        at: tableItem[1],
      });
    }
  }
};
