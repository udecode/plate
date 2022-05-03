import {
  isFirstChild,
  PlateEditor,
  TElement,
  TNodeEntry,
  Value,
} from '@udecode/plate-core';
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
    list: TNodeEntry<TElement>;
    listItem: TNodeEntry<TElement>;
  }
) => {
  const [, listPath] = list;
  const [, listItemPath] = listItem;

  if (!isListNested(editor, listPath) && !isFirstChild(listItemPath)) {
    moveListItemUp(editor, { list, listItem });

    return true;
  }

  return false;
};
