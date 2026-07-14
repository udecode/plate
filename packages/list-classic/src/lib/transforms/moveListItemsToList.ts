import type { BaseEditor } from '@platejs/core';
import {
  type Element,
  type ElementEntry,
  type Path,
  ElementApi,
} from '@platejs/plite';

import type { ListTransaction } from '../BaseListPlugin';

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
  editor: BaseEditor,
  tx: ListTransaction,
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

  if (fromListItem) {
    const sublistIndex = fromListItem[0].children.findIndex(
      (node) =>
        ElementApi.isElement(node) && getListTypes(editor).includes(node.type)
    );

    if (sublistIndex === -1) return;

    fromListPath = fromListItem[1].concat(sublistIndex);
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

  const fromListNode = editor.read.nodes.get<Element>(fromListPath)?.[0];

  if (!fromListNode) return;

  const childRefs = fromListNode.children
    .map((_, index) => fromListPath!.concat(index))
    .slice(fromStartIndex)
    .map((path) => tx.refs.path(path));

  for (const ref of childRefs.reverse()) {
    const at = ref.unref();

    if (at) tx.nodes.move({ at, to });
  }

  moved = childRefs.length > 0;

  // Remove the empty list
  if (deleteFromList) {
    tx.nodes.remove({ at: fromListPath });
  }

  return moved;
};
