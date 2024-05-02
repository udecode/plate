import {
  deleteText,
  findDescendant,
  getLastChildPath,
  moveChildren,
  MoveChildrenOptions,
  PlateEditor,
  TElementEntry,
  Value,
  withoutNormalizing,
} from '@udecode/plate-common/server';
import { Path } from 'slate';

import { getListTypes } from '../queries/getListTypes';

export interface MergeListItemIntoListOptions<V extends Value = Value> {
  /**
   * List items of the sublist of this node will be moved.
   */
  fromListItem?: TElementEntry;

  /**
   * List items of the list will be moved.
   */
  fromList?: TElementEntry;

  /**
   * List items will be moved in this list.
   */
  toList?: TElementEntry;

  fromStartIndex?: MoveChildrenOptions<V>['fromStartIndex'];

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
export const moveListItemsToList = <V extends Value>(
  editor: PlateEditor<V>,
  {
    fromList,
    fromListItem,
    fromStartIndex,
    to: _to,
    toList,
    toListIndex = null,
    deleteFromList = true,
  }: MergeListItemIntoListOptions<V>
) => {
  let fromListPath: Path | undefined;
  let moved;

  withoutNormalizing(editor, () => {
    if (fromListItem) {
      const fromListItemSublist = findDescendant(editor, {
        at: fromListItem[1],
        match: {
          type: getListTypes(editor),
        },
      });
      if (!fromListItemSublist) return;

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
      if (toListIndex === null) {
        const lastChildPath = getLastChildPath(toList);
        to = Path.next(lastChildPath);
      } else {
        to = toList[1].concat([toListIndex]);
      }
    }
    if (!to) return;

    moved = moveChildren(editor, {
      at: fromListPath,
      to,
      fromStartIndex,
    });

    // Remove the empty list
    if (deleteFromList) {
      deleteText(editor, { at: fromListPath });
    }
  });

  return moved;
};
