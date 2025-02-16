import {
  type ElementEntry,
  type SlateEditor,
  type TElement,
  deleteMerge,
  PathApi,
} from '@udecode/plate';

import {
  BaseListItemContentPlugin,
  BaseListItemPlugin,
} from '../BaseListPlugin';
import { hasListChild } from '../queries/hasListChild';
import { moveListItemsToList } from './moveListItemsToList';
import { moveListItemSublistItemsToListItemSublist } from './moveListItemSublistItemsToListItemSublist';

export interface RemoveListItemOptions {
  list: ElementEntry;
  listItem: ElementEntry;
  reverse?: boolean;
}

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

  const previousLiPath = PathApi.previous(liPath);

  let success = false;

  editor.tf.withoutNormalizing(() => {
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
      const previousLi = editor.api.node<TElement>(previousLiPath);

      if (!previousLi) return;

      // 1
      let tempLiPath = PathApi.next(liPath);
      editor.tf.insertNodes(
        {
          children: [
            {
              children: [{ text: '' }],
              type: editor.getType(BaseListItemContentPlugin),
            },
          ],
          type: editor.getType(BaseListItemPlugin),
        },
        { at: tempLiPath }
      );

      const tempLi = editor.api.node<TElement>(tempLiPath);

      if (!tempLi) return;

      const tempLiPathRef = editor.api.pathRef(tempLi[1]);

      // 2
      moveListItemSublistItemsToListItemSublist(editor, {
        fromListItem: listItem,
        toListItem: tempLi,
      });

      // 3
      deleteMerge(editor, {
        reverse,
      });

      tempLiPath = tempLiPathRef.unref()!;

      // 4
      moveListItemSublistItemsToListItemSublist(editor, {
        fromListItem: [tempLi[0], tempLiPath],
        toListItem: previousLi,
      });

      // 5
      editor.tf.removeNodes({ at: tempLiPath });

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

  return success;
};
