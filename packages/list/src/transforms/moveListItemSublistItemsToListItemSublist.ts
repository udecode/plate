import {
  deleteText,
  findDescendant,
  getLastChildPath,
  getParentNode,
  insertElements,
  moveChildren,
  PlateEditor,
  TElement,
  TElementEntry,
  Value,
  withoutNormalizing,
} from '@udecode/plate-common';
import { Path } from 'slate';

import { getListTypes } from '../queries/getListTypes';

export interface MoveListItemSublistItemsToListItemSublistOptions {
  /**
   * The list item to merge.
   */
  fromListItem: TElementEntry;

  /**
   * The list item where to merge.
   */
  toListItem: TElementEntry;

  /**
   * Move to the start of the list instead of the end.
   */
  start?: boolean;
}

/**
 * Move fromListItem sublist list items to the end of `toListItem` sublist.
 * If there is no `toListItem` sublist, insert one.
 */
export const moveListItemSublistItemsToListItemSublist = <V extends Value>(
  editor: PlateEditor<V>,
  {
    fromListItem,
    toListItem,
    start,
  }: MoveListItemSublistItemsToListItemSublistOptions
) => {
  const [, fromListItemPath] = fromListItem;
  const [, toListItemPath] = toListItem;
  let moved = 0;

  withoutNormalizing(editor, () => {
    const fromListItemSublist = findDescendant<TElement>(editor, {
      at: fromListItemPath,
      match: {
        type: getListTypes(editor),
      },
    });
    if (!fromListItemSublist) return;

    const [, fromListItemSublistPath] = fromListItemSublist;

    const toListItemSublist = findDescendant<TElement>(editor, {
      at: toListItemPath,
      match: {
        type: getListTypes(editor),
      },
    });

    let to: Path;

    if (!toListItemSublist) {
      const fromList = getParentNode(editor, fromListItemPath);
      if (!fromList) return;
      const [fromListNode] = fromList;

      const fromListType = fromListNode.type;

      const toListItemSublistPath = toListItemPath.concat([1]);

      insertElements(
        editor,
        { type: fromListType as string, children: [] },
        { at: toListItemSublistPath }
      );

      to = toListItemSublistPath.concat([0]);
    } else if (start) {
      const [, toListItemSublistPath] = toListItemSublist;
      to = toListItemSublistPath.concat([0]);
    } else {
      to = Path.next(getLastChildPath(toListItemSublist));
    }

    moved = moveChildren(editor, {
      at: fromListItemSublistPath,
      to,
    });

    // Remove the empty list
    deleteText(editor, { at: fromListItemSublistPath });
  });

  return moved;
};
