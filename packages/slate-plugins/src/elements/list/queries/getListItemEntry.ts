import { Editor, Location } from 'slate';
import { getAboveByType } from '../../../common/queries/getAboveByType';
import { getParent } from '../../../common/queries/getParent';
import { hasNodeByType } from '../../../common/queries/hasNodeByType';
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

  if (at && hasNodeByType(editor, li.type, { at })) {
    const selectionParent = getParent(editor, at);
    if (!selectionParent) return;
    const [, paragraphPath] = selectionParent;

    const listItem =
      getAboveByType(editor, li.type, { at }) ||
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
