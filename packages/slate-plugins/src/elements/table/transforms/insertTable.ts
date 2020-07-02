import { Editor, Transforms } from 'slate';
import { isNodeTypeIn } from '../../../common/queries';
import { defaultTableTypes } from '../types';
import { getEmptyTableNode } from '../utils';

export const insertTable = (editor: Editor, options = defaultTableTypes) => {
  if (!isNodeTypeIn(editor, options.typeTable)) {
    Transforms.insertNodes(editor, getEmptyTableNode(options));
  }
};
