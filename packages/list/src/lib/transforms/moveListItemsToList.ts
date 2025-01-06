import {
  type ElementEntry,
  type MoveChildrenOptions,
  type Path,
  type SlateEditor,
  PathApi,
  getLastChildPath,
  moveChildren,
} from '@udecode/plate-common';

import { getListTypes } from '../queries/getListTypes';

export interface MergeListItemIntoListOptions {
  /**
   * Delete `fromListItem` sublist if true.
   *
   * @default true
   */
  deleteFromList?: boolean;

  /** List items of the list will be moved. */
  fromList?: ElementEntry;

  /** List items of the sublist of this node will be moved. */
  fromListItem?: ElementEntry;

  fromStartIndex?: MoveChildrenOptions['fromStartIndex'];

  to?: Path;

  /** List items will be moved in this list. */
  toList?: ElementEntry;

  /** List position where to move the list items. */
  toListIndex?: number | null;
}

/**
 * Move the list items of the sublist of `fromListItem` to `toList` (if
 * `fromListItem` is defined). Move the list items of `fromList` to `toList` (if
 * `fromList` is defined).
 */
export const moveListItemsToList = (
  editor: SlateEditor,
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

  editor.tf.withoutNormalizing(() => {
    if (fromListItem) {
      const fromListItemSublist = editor.api.descendant({
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
        to = PathApi.next(lastChildPath);
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
      editor.tf.delete({ at: fromListPath });
    }
  });

  return moved;
};
