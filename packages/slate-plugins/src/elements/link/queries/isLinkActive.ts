import { Editor } from 'slate';
import { LINK } from '../types';

export const isLinkActive = (editor: Editor, { typeLink = LINK } = {}) => {
  const [link] = Editor.nodes(editor, {
    match: (n) => n.type === typeLink,
  });

  return !!link;
};
