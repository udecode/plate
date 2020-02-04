import { isBlockActive } from 'elements/queries';
import { Editor, Transforms } from 'slate';
import { TableType } from '../types';

export const deleteTable = (editor: Editor) => {
  const isActive = isBlockActive(editor, TableType.TABLE);

  if (isActive) {
    const tableItem = Editor.above(editor, {
      match: node => node.type === TableType.TABLE,
    });
    if (tableItem) {
      Transforms.removeNodes(editor, {
        at: tableItem[1],
      });
    }
  }
};
