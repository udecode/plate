import { isNodeInSelection } from 'common/queries';
import { unwrapNodesByType } from 'common/transforms';
import { Editor, Transforms } from 'slate';
import { CODE } from '../types';

export const toggleCode = (editor: Editor, { typeCode = CODE } = {}) => {
  if (isNodeInSelection(editor, typeCode)) {
    unwrapNodesByType(editor, typeCode);
  } else {
    Transforms.wrapNodes(editor, {
      type: typeCode,
      children: [],
    });
  }
};
