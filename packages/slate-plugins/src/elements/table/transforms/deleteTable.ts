import { defaultTableTypes } from 'elements/table/types';
import { Editor, Transforms } from 'slate';
import { isSelectionInTable, isTable } from '../queries';

export const deleteTable = (editor: Editor, options = defaultTableTypes) => {
  if (isSelectionInTable(editor, options)) {
    const tableItem = Editor.above(editor, {
      match: isTable(options),
    });
    if (tableItem) {
      Transforms.removeNodes(editor, {
        at: tableItem[1],
      });
    }
  }
};
