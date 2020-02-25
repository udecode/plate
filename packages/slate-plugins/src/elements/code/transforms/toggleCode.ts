import { Editor, Transforms } from 'slate';
import { isBlockActive } from '../../queries';
import { CODE } from '../types';

export const toggleCode = (editor: Editor) => {
  if (isBlockActive(editor, CODE)) {
    Transforms.unwrapNodes(editor, {
      match: node => node.type === CODE,
    });
  } else {
    Transforms.wrapNodes(editor, {
      type: CODE,
      children: [],
    });
  }
};
