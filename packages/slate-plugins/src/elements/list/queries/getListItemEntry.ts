import { Editor, Location, Range } from 'slate';
import { isCollapsed } from '../../../common';
import { getAbove } from '../../../common/queries/getAbove';
import { getParent } from '../../../common/queries/getParent';
import { someNode } from '../../../common/queries/someNode';
import { setDefaults } from '../../../common/utils/setDefaults';
import { DEFAULTS_LIST } from '../defaults';
import { ListOptions } from '../types';

/**
 * If at (default = selection) is in ul>li>p, return li and ul node entries.
 */
export const getListItemEntry = (
  editor: Editor,
  { at = editor.selection }: { at?: Location | null } = {},
  options?: ListOptions
) => {
  const { li } = setDefaults(options, DEFAULTS_LIST);

  if (at && someNode(editor, { at, match: { type: li.type } })) {
    const selectionParent = getParent(editor, at);
    if (!selectionParent) return;
    const [, paragraphPath] = selectionParent;

    // If selection range includes root list item
    if (Range.isRange(at) && !isCollapsed(at) && paragraphPath.length === 1) {
      at = at.focus.path;
    }

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
