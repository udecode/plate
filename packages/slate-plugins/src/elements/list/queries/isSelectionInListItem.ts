import { Editor } from 'slate';
import { getAboveByType } from '../../../common/queries/getAboveByType';
import { getParent } from '../../../common/queries/getParent';
import { isNodeTypeIn } from '../../../common/queries/isNodeTypeIn';
import { setDefaults } from '../../../common/utils/setDefaults';
import { DEFAULTS_LIST } from '../defaults';
import { ListOptions } from '../types';

/**
 * Is the selection in li>p.
 * If true, return the node entries.
 */
export const isSelectionInListItem = (
  editor: Editor,
  options?: ListOptions
) => {
  const { li } = setDefaults(options, DEFAULTS_LIST);

  if (editor.selection && isNodeTypeIn(editor, li.type)) {
    const selectionParentEntry = getParent(editor, editor.selection);
    if (!selectionParentEntry) return;
    const [, paragraphPath] = selectionParentEntry;

    const listItemEntry =
      getAboveByType(editor, li.type) || getParent(editor, paragraphPath);
    if (!listItemEntry) return;
    const [listItemNode, listItemPath] = listItemEntry;

    if (listItemNode.type !== li.type) return;

    const listEntry = getParent(editor, listItemPath);
    if (!listEntry) return;
    const [listNode, listPath] = listEntry;

    return {
      listNode,
      listPath,
      listItemNode,
      listItemPath,
    };
  }
};
