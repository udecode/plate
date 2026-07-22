import type { BaseEditor } from '@platejs/core';
import { type Element, type ElementEntry, PathApi } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import type { ListTransaction } from '../BaseListPlugin';

import { getPropsIfTaskListLiNode, hasListChild } from '../queries';
import { moveListItemsToList } from './moveListItemsToList';
import { moveListItemSublistItemsToListItemSublist } from './moveListItemSublistItemsToListItemSublist';

export type RemoveListItemOptions = {
  list: ElementEntry;
  listItem: ElementEntry;
  reverse?: boolean;
};

/** Remove list item and move its sublist to list if any. */
export const removeListItem = (
  editor: BaseEditor,
  tx: ListTransaction,
  { list, listItem, reverse = true }: RemoveListItemOptions
) => {
  const [liNode, liPath] = listItem;

  // Stop if the list item has no sublist
  if (tx.selection.isExpanded() || !hasListChild(editor, liNode)) {
    return false;
  }

  const previousLiPath = PathApi.hasPrevious(liPath)
    ? PathApi.previous(liPath)
    : undefined;

  let success = false;
  /**
   * If there is a previous li, we need to move sub-lis to the previous li. As
   * we need to delete first, we will:
   *
   * 1. Insert a temporary li: tempLi
   * 2. Move sub-lis to tempLi
   * 3. Delete
   * 4. Move sub-lis from tempLi to the previous li.
   * 5. Remove tempLi
   */
  if (previousLiPath) {
    const previousLi = tx.nodes.get<Element>(previousLiPath);

    if (!previousLi) return;

    // 1
    let tempLiPath = PathApi.next(liPath);
    tx.nodes.insert(
      {
        children: [
          {
            children: [{ text: '' }],
            type: editor.getType(KEYS.lic),
          },
        ],
        ...getPropsIfTaskListLiNode(editor, {
          inherit: true,
          liNode: previousLi[0],
        }),
        type: editor.getType(KEYS.li),
      },
      { at: tempLiPath }
    );

    const tempLi = tx.nodes.get<Element>(tempLiPath);

    if (!tempLi) return;

    const tempLiRef = tx.refs.path(tempLi[1], {
      association: 'forward',
      deletion: 'drop',
    });

    // 2
    moveListItemSublistItemsToListItemSublist(editor, tx, {
      fromListItem: listItem,
      toListItem: tempLi,
    });

    // 3
    tx.text.delete({ reverse });

    const currentTempLiPath = tempLiRef.resolve();

    if (!currentTempLiPath) return;

    tempLiPath = currentTempLiPath;
    const currentTempLi = tx.nodes.get<Element>(tempLiPath);
    const currentPreviousLi = tx.nodes.get<Element>(previousLiPath);

    if (!currentTempLi || !currentPreviousLi) return;

    // 4
    moveListItemSublistItemsToListItemSublist(editor, tx, {
      fromListItem: currentTempLi,
      toListItem: currentPreviousLi,
    });

    // 5
    tx.nodes.remove({ at: tempLiPath });

    success = true;

    return true;
  }

  // If it's the first li, move the sublist to the parent list
  moveListItemsToList(editor, tx, {
    fromListItem: listItem,
    toList: list,
    toListIndex: 1,
  });

  return success;
};
