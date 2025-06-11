import {
  type ElementEntry,
  type Path,
  type SlateEditor,
  NodeApi,
  PathApi,
} from '@udecode/plate';

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

  fromStartIndex?: number;

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
  let moved: boolean | void = false;

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
      fromListPath = fromList[1];
    } else {
      return;
    }

    let to: Path | null = null;

    if (_to) to = _to;
    if (toList) {
      if (toListIndex === null) {
        const lastChildPath = NodeApi.lastChild(editor, toList[1])?.[1];
        to = lastChildPath
          ? PathApi.next(lastChildPath)
          : toList[1].concat([0]);
      } else {
        to = toList[1].concat([toListIndex]);
      }
    }
    if (!to) return;

    moved = editor.tf.moveNodes({
      at: fromListPath,
      children: true,
      fromIndex: fromStartIndex,
      to,
    });

    // Remove the empty list
    if (deleteFromList) {
      editor.tf.delete({ at: fromListPath });
    }
  });

  return moved;
};
