import { Editor, Range } from 'slate';
import { isLinkActive } from '../queries/isLinkActive';
import { unwrapLink } from './unwrapLink';

export const wrapLink = (editor: Editor, url: string) => {
  if (isLinkActive(editor)) {
    unwrapLink(editor);
  }
  const { selection } = editor;
  const isCollapsed = selection && Range.isCollapsed(selection);
  const link = {
    type: 'link',
    url,
    children: isCollapsed ? [{ text: url }] : [],
  };
  if (isCollapsed) {
    Editor.insertNodes(editor, link);
  } else {
    Editor.wrapNodes(editor, link, { split: true });
    Editor.collapse(editor, { edge: 'end' });
  }
};
