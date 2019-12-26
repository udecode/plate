import { Editor, Transforms } from 'slate';
import { LINK } from '../types';

export const unwrapLink = (editor: Editor) => {
  Transforms.unwrapNodes(editor, { match: n => n.type === LINK });
};
