import { Editor } from 'slate';
import { isNodeTypeIn } from '../../../common/queries/isNodeTypeIn';
import { isRangeAtRoot } from '../../../common/queries/isRangeAtRoot';
import { setDefaults } from '../../../common/utils/setDefaults';
import { DEFAULTS_LIST } from '../defaults';
import { ListOptions } from '../types';
import { getAboveByType } from '../../../common/queries/getAboveByType';

/**
 * Is the selection in li>p.
 * If true, return the node entries.
 */
export const isSelectionInListItem = (
  editor: Editor,
  options?: ListOptions
) => {
  const { p, li } = setDefaults(options, DEFAULTS_LIST);

  if (
    editor.selection &&
    isNodeTypeIn(editor, li.type) &&
    !isRangeAtRoot(editor.selection)
  ) {
    const [, paragraphPath] = Editor.parent(
      editor,
      editor.selection
    );

    const [listItemNode, listItemPath] = getAboveByType(editor, li.type) ||  Editor.parent(editor, paragraphPath);

    if (listItemNode.type !== li.type) return;
    const [listNode, listPath] = Editor.parent(editor, listItemPath);

    return {
      listNode,
      listPath,
      listItemNode,
      listItemPath,
    };
  }
};
