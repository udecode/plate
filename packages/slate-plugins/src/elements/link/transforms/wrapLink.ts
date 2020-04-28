import { isLinkActive } from 'elements/link/queries';
import { Editor, Range, Transforms } from 'slate';
import { LINK } from '../types';
import { unwrapLink } from './unwrapLink';

export const wrapLink = (
  editor: Editor,
  url: string,
  { typeLink = LINK } = {}
) => {
  if (isLinkActive(editor)) {
    unwrapLink(editor, { typeLink });
  }

  const { selection } = editor;
  const isCollapsed = selection && Range.isCollapsed(selection);
  const link = {
    type: typeLink,
    url,
    children: isCollapsed ? [{ text: url }] : [],
  };

  if (isCollapsed) {
    Transforms.insertNodes(editor, link);
  } else {
    Transforms.wrapNodes(editor, link, { split: true });
    Transforms.collapse(editor, { edge: 'end' });
  }
};
