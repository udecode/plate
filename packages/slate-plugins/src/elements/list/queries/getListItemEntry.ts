import { getAbove, getParent, someNode } from '@udecode/slate-plugins-common';
import { getPluginType, TElement } from '@udecode/slate-plugins-core';
import { Editor, Location, NodeEntry } from 'slate';
import { ELEMENT_LI } from '../defaults';

/**
 * If at (default = selection) is in ul>li>p, return li and ul node entries.
 */
export const getListItemEntry = (
  editor: Editor,
  { at = editor.selection }: { at?: Location | null } = {}
): { list: NodeEntry<TElement>; listItem: NodeEntry<TElement> } | undefined => {
  const liType = getPluginType(editor, ELEMENT_LI);
  if (at && someNode(editor, { at, match: { type: liType } })) {
    const selectionParent = getParent(editor, at);
    if (!selectionParent) return;
    const [, paragraphPath] = selectionParent;

    // If selection range includes root list item
        if (Range.isRange(at) && !isCollapsed(at) && paragraphPath.length === 1) {
          at = at.focus.path;
        }

    const listItem =
      getAbove<TElement>(editor, { at, match: { type: liType } }) ||
      getParent<TElement>(editor, paragraphPath);

    if (!listItem) return;
    const [listItemNode, listItemPath] = listItem;

    if (listItemNode.type !== liType) return;

    const list = getParent<TElement>(editor, listItemPath);
    if (!list) return;

    return {
      list,
      listItem,
    };
  }
};
