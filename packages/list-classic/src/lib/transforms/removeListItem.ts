import type { Element } from '@platejs/slate';
import type { ElementEntry } from '@platejs/slate';
import { PathApi } from '@platejs/slate';
import type { SlateEditor } from '@platejs/core';
import { KEYS } from '@platejs/utils';
import { runWithoutNormalizing } from '../internal/runWithoutNormalizing';

import {
  getPreviousSiblingPath,
  getPropsIfTaskListLiNode,
  hasListChild,
} from '../queries';
import { moveListItemsToList } from './moveListItemsToList';
import { moveListItemSublistItemsToListItemSublist } from './moveListItemSublistItemsToListItemSublist';

export type RemoveListItemOptions = {
  list: ElementEntry;
  listItem: ElementEntry;
  reverse?: boolean;
};

/** Remove list item and move its sublist to list if any. */
export const removeListItem = (
  editor: SlateEditor,
  { list, listItem, reverse = true }: RemoveListItemOptions
) => {
  const [liNode, liPath] = listItem;

  // Stop if the list item has no sublist
  if (editor.api.isExpanded() || !hasListChild(editor, liNode)) {
    return false;
  }

  const previousLiPath = getPreviousSiblingPath(liPath);

  let success = false;

  editor.update((tx) => {
    runWithoutNormalizing(tx, () => {
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
        const previousLi = editor.api.node<Element>(previousLiPath);

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

        const tempLi = editor.api.node<Element>(tempLiPath);

        if (!tempLi) return;

        const tempLiPathRef = editor.api.pathRef(tempLi[1]);

        // 2
        moveListItemSublistItemsToListItemSublist(editor, {
          fromListItem: listItem,
          toListItem: tempLi,
        });

        // 3
        tx.text.delete({
          reverse,
        });

        tempLiPath = tempLiPathRef.unref()!;

        // 4
        moveListItemSublistItemsToListItemSublist(editor, {
          fromListItem: [tempLi[0], tempLiPath],
          toListItem: previousLi,
        });

        // 5
        tx.nodes.remove({ at: tempLiPath });

        success = true;

        return;
      }

      // If it's the first li, move the sublist to the parent list
      moveListItemsToList(editor, {
        fromListItem: listItem,
        toList: list,
        toListIndex: 1,
      });
    });
  });

  return success;
};
