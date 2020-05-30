import { Editor, Transforms } from 'slate';
import { isNodeInSelection } from '../../../common/queries';
import { isCollapsed } from '../../../common/queries/isCollapsed';
import { unwrapNodesByType } from '../../../common/transforms';
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
  const collapsed = isCollapsed(selection);
  const link = {
    type: typeLink,
    url,
    children: collapsed ? [{ text: url }] : [],
  };

  if (collapsed) {
    Transforms.insertNodes(editor, link);
  } else {
    Transforms.wrapNodes(editor, link, { split: true });
    Transforms.collapse(editor, { edge: 'end' });
  }
};
