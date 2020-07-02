import { Editor, Location, Transforms } from 'slate';
import { isCollapsed } from '../../../common/queries/isCollapsed';
import { LINK } from '../types';

/**
 * If there is a link node in selection, unwrap it.
 * If the selection is collapsed: insert the link.
 * If the selection is expanded: wrap selected nodes with a link
 * and collapse at the end.
 */
export const wrapLink = (
  editor: Editor,
  url: string,
  {
    typeLink = LINK,
    at,
  }: {
    typeLink?: string;
    at?: Location;
  } = {}
) => {
  const { selection } = editor;
  const collapsed = isCollapsed(selection);

  const wrap = !collapsed || !!at;

  const link = {
    type: typeLink,
    url,
    children: wrap ? [] : [{ text: url }],
  };

  if (wrap) {
    Transforms.wrapNodes(editor, link, { at, split: true });
    Transforms.collapse(editor, { edge: 'end' });
  } else {
    Transforms.insertNodes(editor, link);
  }
};
