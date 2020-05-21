import { isNodeInSelection } from 'common/queries';
import { getEmptyTableNode } from 'elements/table/utils/getEmptyTableNode';
import { Editor, Transforms } from 'slate';
import { defaultTableTypes } from '../types';

export const insertTable = (editor: Editor, options = defaultTableTypes) => {
  if (!isNodeInSelection(editor, options.typeTable)) {
    Transforms.insertNodes(editor, getEmptyTableNode(options));
  }
};
