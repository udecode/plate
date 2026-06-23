import type { Element, ElementEntry, Path } from '@platejs/slate';
import type { SlateEditor } from '@platejs/core';
import { getEditorDescendant } from '../internal/editorQueries';
import { runWithoutNormalizing } from '../internal/runWithoutNormalizing';

import { getListTypes } from '../queries/getListTypes';

export type MergeListItemIntoListOptions = {
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
};

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

  editor.update((tx) => {
    runWithoutNormalizing(tx, () => {
      if (fromListItem) {
        const fromListItemSublist = getEditorDescendant(editor, {
          at: fromListItem[1],
          match: (node) => getListTypes(editor).includes(node.type),
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
          to = toList[1].concat([toList[0].children.length]);
        } else {
          to = toList[1].concat([toListIndex]);
        }
      }
      if (!to) return;

      const fromListNode = editor.api.node<Element>(fromListPath)?.[0];
      const startIndex = fromStartIndex ?? 0;

      if (!fromListNode) return;

      for (
        let index = fromListNode.children.length - 1;
        index >= startIndex;
        index--
      ) {
        tx.nodes.move({
          at: [...fromListPath, index],
          to,
        });
        moved = true;
      }

      // Remove the empty list
      if (deleteFromList) {
        tx.nodes.remove({ at: fromListPath });
      }
    });
  });

  return moved;
};
