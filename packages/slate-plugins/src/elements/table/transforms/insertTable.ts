import { isNodeInSelection } from 'common/queries';
import { Editor, Transforms } from 'slate';
import { defaultTableTypes, emptyTable } from '../types';

export const insertTable = (editor: Editor, options = defaultTableTypes) => {
  if (!isNodeInSelection(editor, options.typeTable)) {
    Transforms.insertNodes(editor, emptyTable(options));
  }
};
