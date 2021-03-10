import { isFirstChild } from '@udecode/slate-plugins-common';
import { SlatePluginsOptions } from '@udecode/slate-plugins-core';
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
  },
  options: SlatePluginsOptions
) => {
  const [, listPath] = list;
  const [, listItemPath] = listItem;

  if (!isListNested(editor, listPath, options) && isFirstChild(listItemPath)) {
    moveListItemUp(editor, { list, listItem }, options);

    return true;
  }

  return false;
};
