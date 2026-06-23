import type { ElementEntry } from '@platejs/slate';
import { PathApi } from '@platejs/slate';
import type { SlateEditor } from '@platejs/core';

import { isListNested } from '../queries/isListNested';
import { moveListItemUp } from './moveListItemUp';

/** If list is not nested and if li is not the first child, move li up. */
export const removeFirstListItem = (
  editor: SlateEditor,
  {
    list,
    listItem,
  }: {
    list: ElementEntry;
    listItem: ElementEntry;
  }
) => {
  const [, listPath] = list;
  const [, listItemPath] = listItem;

  if (!isListNested(editor, listPath) && PathApi.hasPrevious(listItemPath)) {
    moveListItemUp(editor, { list, listItem });

    return true;
  }

  return false;
};
