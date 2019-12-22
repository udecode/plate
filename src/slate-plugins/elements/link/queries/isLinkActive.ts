import { Editor } from 'slate';
import { LINK } from '../types';

export const isLinkActive = (editor: Editor) => {
  const [link] = Editor.nodes(editor, {
    match: n => n.type === LINK,
  });

  return !!link;
};
