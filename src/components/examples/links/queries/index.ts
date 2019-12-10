import { Editor } from 'slate';

export const isLinkActive = (editor: Editor) => {
  const [link] = Editor.nodes(editor, { match: { type: 'link' } });
  return !!link;
};
