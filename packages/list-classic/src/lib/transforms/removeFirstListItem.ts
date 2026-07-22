import type { BaseEditor } from '@platejs/core';
import type { ElementEntry } from '@platejs/plite';

import type { ListTransaction } from '../BaseListPlugin';

import { isListNested } from '../queries/isListNested';
import { moveListItemUp } from './moveListItemUp';

/** If list is not nested and if li is not the first child, move li up. */
export const removeFirstListItem = (
  editor: BaseEditor,
  tx: ListTransaction,
  {
    list,
    listItem,
  }: {
    list: ElementEntry;
    listItem: ElementEntry;
  }
) => {
  const [, listPath] = list;

  if (!isListNested(editor, listPath, tx)) {
    moveListItemUp(editor, tx, { list, listItem });

    return true;
  }

  return false;
};
