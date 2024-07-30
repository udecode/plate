import {
  type MoveChildrenOptions,
  type PlateEditor,
  type TElementEntry,
  deleteText,
  findDescendant,
  getLastChildPath,
  moveChildren,
  withoutNormalizing,
} from '@udecode/plate-common/server';
import { Path } from 'slate';

import { getListTypes } from '../queries/getListTypes';

export interface MergeListItemIntoListOptions {
  /**
   * Delete `fromListItem` sublist if true.
   *
   * @default true
   */
  deleteFromList?: boolean;

  /** List items of the list will be moved. */
  fromList?: TElementEntry;

  /** List items of the sublist of this node will be moved. */
  fromListItem?: TElementEntry;

  fromStartIndex?: MoveChildrenOptions['fromStartIndex'];

  to?: Path;

  /** List items will be moved in this list. */
  toList?: TElementEntry;

  /** List position where to move the list items. */
  toListIndex?: null | number;
}

/**
 * Move the list items of the sublist of `fromListItem` to `toList` (if
 * `fromListItem` is defined). Move the list items of `fromList` to `toList` (if
 * `fromList` is defined).
 */
export const moveListItemsToList = (
  editor: PlateEditor,
  {
    deleteFromList = true,
    fromList,
    fromListItem,
    fromStartIndex,
    to: _to,
    toList,
    toListIndex = null,
  }: MergeListItemIntoListOptions
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
      fromStartIndex,
      to,
    });

    // Remove the empty list
    if (deleteFromList) {
      deleteText(editor, { at: fromListPath });
    }
  });

  return moved;
};
