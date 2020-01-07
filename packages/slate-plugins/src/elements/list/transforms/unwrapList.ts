import { Editor, Transforms } from 'slate';
import { isList } from '../queries';

export const unwrapList = (editor: Editor) => {
  Transforms.unwrapNodes(editor, {
    match: isList,
    split: true,
  });
};
