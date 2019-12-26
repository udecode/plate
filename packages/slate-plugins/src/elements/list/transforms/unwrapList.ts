import { Editor, Transforms } from 'slate';
import { ListType } from '../types';

export const unwrapList = (editor: Editor) => {
  Transforms.unwrapNodes(editor, {
    match: n => [ListType.OL_LIST, ListType.UL_LIST].includes(n.type),
    split: true,
  });
};
