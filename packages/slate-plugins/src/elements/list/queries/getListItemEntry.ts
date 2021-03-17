import { getAbove, getParent, someNode } from '@udecode/slate-plugins-common';
import { getPluginType } from '@udecode/slate-plugins-core';
import { Editor, Location } from 'slate';
import { ELEMENT_LI } from '../defaults';

/**
 * If at (default = selection) is in ul>li>p, return li and ul node entries.
 */
export const getListItemEntry = (
  editor: Editor,
  { at = editor.selection }: { at?: Location | null } = {}
) => {
  const liType = getPluginType(editor, ELEMENT_LI);
  if (at && someNode(editor, { at, match: { type: liType } })) {
    const selectionParent = getParent(editor, at);
    if (!selectionParent) return;
    const [, paragraphPath] = selectionParent;

    const listItem =
      getAbove(editor, { at, match: { type: liType } }) ||
      getParent(editor, paragraphPath);

    if (!listItem) return;
    const [listItemNode, listItemPath] = listItem;

    if (listItemNode.type !== liType) return;

    const list = getParent(editor, listItemPath);
    if (!list) return;

    return {
      list,
      listItem,
    };
  }
};
