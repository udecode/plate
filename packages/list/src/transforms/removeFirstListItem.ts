import { PlateEditor, TElementEntry, Value } from '@udecode/plate-common/server';

import { isListNested } from '../queries/isListNested';
import { moveListItemUp } from './moveListItemUp';

/**
 * If list is not nested and if li is not the first child, move li up.
 */
export const removeFirstListItem = <V extends Value>(
  editor: PlateEditor<V>,
  {
    list,
    listItem,
  }: {
    list: TElementEntry;
    listItem: TElementEntry;
  }
) => {
  const [, listPath] = list;

  if (!isListNested(editor, listPath)) {
    moveListItemUp(editor, { list, listItem });

    return true;
  }

  return false;
};
