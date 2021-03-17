import { isFirstChild } from '@udecode/slate-plugins-common';
import { Ancestor, Editor, NodeEntry } from 'slate';
import { isListNested } from '../queries/isListNested';
import { moveListItemUp } from './moveListItemUp';

/**
 * If list is not nested and if li is not the first child, move li up.
 */
export const removeFirstListItem = (
  editor: Editor,
  {
    list,
    listItem,
  }: {
    list: NodeEntry<Ancestor>;
    listItem: NodeEntry<Ancestor>;
  }
) => {
  const [, listPath] = list;
  const [, listItemPath] = listItem;

  if (!isListNested(editor, listPath) && isFirstChild(listItemPath)) {
    moveListItemUp(editor, { list, listItem });

    return true;
  }

  return false;
};
