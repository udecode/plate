import { Editor, Transforms } from 'slate';
import { isSelectionInTable } from '../queries';
import { defaultTableTypes, emptyTable } from '../types';

export const insertTable = (editor: Editor, options = defaultTableTypes) => {
  if (!isSelectionInTable(editor, options)) {
    Transforms.insertNodes(editor, emptyTable(options));
  }
};
