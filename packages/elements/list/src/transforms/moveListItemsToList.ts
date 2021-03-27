import {
  findDescendant,
  getLastChildPath,
  moveChildren,
  MoveChildrenOptions,
} from '@udecode/slate-plugins-common';
import { SPEditor, TElement } from '@udecode/slate-plugins-core';
import { NodeEntry, Path, Transforms } from 'slate';
import { getListTypes } from '../queries/getListTypes';

export interface MergeListItemIntoListOptions {
  /**
   * List items of the sublist of this node will be moved.
   */
  fromListItem?: NodeEntry<TElement>;

  /**
   * List items of the list will be moved.
   */
  fromList?: NodeEntry<TElement>;

  /**
   * List items will be moved in this list.
   */
  toList?: NodeEntry<TElement>;

  fromStartIndex?: MoveChildrenOptions['fromStartIndex'];

  /**
   * List position where to move the list items.
   */
  toListIndex?: number | null;

  to?: Path;

  /**
   * Delete `fromListItem` sublist if true.
   * @default true
   */
  deleteFromList?: boolean;
}

/**
 * Move the list items of the sublist of `fromListItem` to `toList` (if `fromListItem` is defined).
 * Move the list items of `fromList` to `toList` (if `fromList` is defined).
 */
export const moveListItemsToList = (
  editor: SPEditor,
  {
    fromList,
    fromListItem,
    fromStartIndex,
    to: _to,
    toList,
    toListIndex = null,
    deleteFromList = true,
  }: MergeListItemIntoListOptions
) => {
  let fromListPath: Path | undefined;

  if (fromListItem) {
    const fromListItemSublist = findDescendant(editor, {
      at: fromListItem[1],
      match: {
        type: getListTypes(editor),
      },
    });
    if (!fromListItemSublist) return 0;

    fromListPath = fromListItemSublist?.[1];
  } else if (fromList) {
    // eslint-disable-next-line prefer-destructuring
    fromListPath = fromList[1];
  } else {
    return;
  }

  let to: Path | null = null;

  if (_to) to = _to;
  if (toList) {
    if (toListIndex !== null) to = toList[1].concat([toListIndex]);
    else {
      const lastChildPath = getLastChildPath(toList);
      to = Path.next(lastChildPath);
    }
  }
  if (!to) return;

  const moved = moveChildren(editor, {
    at: fromListPath,
    to,
    fromStartIndex,
  });

  // Remove the empty list
  if (deleteFromList) {
    Transforms.delete(editor, { at: fromListPath });
  }

  return moved;
};
