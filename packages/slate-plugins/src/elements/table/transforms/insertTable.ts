import { Editor, Transforms } from 'slate';
import { isSelectionInTable } from '../queries';
import { emptyTable } from '../types';

export const insertTable = (editor: Editor) => {
  if (!isSelectionInTable(editor)) {
    Transforms.insertNodes(editor, emptyTable());
  }
};
