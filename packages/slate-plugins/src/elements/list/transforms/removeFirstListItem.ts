import { Ancestor, Editor, NodeEntry } from 'slate';
import { isFirstChild } from '../../../common/queries/isFirstChild';
import { isListNested } from '../queries/isListNested';
import { ListOptions } from '../types';
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
  },
  options?: ListOptions
) => {
  const [, listPath] = list;
  const [, listItemPath] = listItem;

  if (!isListNested(editor, listPath, options) && isFirstChild(listItemPath)) {
    moveListItemUp(editor, { list, listItem }, options);

    return true;
  }

  return false;
};
