import { isNodeInSelection } from 'common/queries';
import { unwrapNodesByType } from 'common/transforms';
import { Editor, Range, Transforms } from 'slate';
import { LINK } from '../types';

export const wrapLink = (
  editor: Editor,
  url: string,
  { typeLink = LINK } = {}
) => {
  if (isNodeInSelection(editor, typeLink)) {
    unwrapNodesByType(editor, typeLink);
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
