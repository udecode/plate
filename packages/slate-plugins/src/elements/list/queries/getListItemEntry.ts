import { getAbove, getParent, someNode } from '@udecode/slate-plugins-common';
import { SlatePluginsOptions } from '@udecode/slate-plugins-core';
import { Editor, Location } from 'slate';

/**
 * If at (default = selection) is in ul>li>p, return li and ul node entries.
 */
export const getListItemEntry = (
  editor: Editor,
  { at = editor.selection }: { at?: Location | null } = {},
  { li }: SlatePluginsOptions
) => {
  if (at && someNode(editor, { at, match: { type: li.type } })) {
    const selectionParent = getParent(editor, at);
    if (!selectionParent) return;
    const [, paragraphPath] = selectionParent;

    const listItem =
      getAbove(editor, { at, match: { type: li.type } }) ||
      getParent(editor, paragraphPath);

    if (!listItem) return;
    const [listItemNode, listItemPath] = listItem;

    if (listItemNode.type !== li.type) return;

    const list = getParent(editor, listItemPath);
    if (!list) return;

    return {
      list,
      listItem,
    };
  }
};
