import { Editor } from 'slate';
import { isLinkActive } from '../queries';

export const unwrapLink = (editor: Editor) => {
  Editor.unwrapNodes(editor, { match: { type: 'link' } });
};

export const wrapLink = (editor: Editor, url: string) => {
  if (isLinkActive(editor)) {
    unwrapLink(editor);
  }

  const link = { type: 'link', url, children: [] };
  Editor.wrapNodes(editor, link, { split: true });
  Editor.collapse(editor, { edge: 'end' });
};
