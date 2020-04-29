import { Editor, Transforms } from 'slate';
import { isBlockActive } from '../../queries';
import { CODE } from '../types';

export const toggleCode = (editor: Editor, { typeCode = CODE } = {}) => {
  if (isBlockActive(editor, typeCode)) {
    Transforms.unwrapNodes(editor, {
      match: (node) => node.type === typeCode,
    });
  } else {
    Transforms.wrapNodes(editor, {
      type: typeCode,
      children: [],
    });
  }
};
