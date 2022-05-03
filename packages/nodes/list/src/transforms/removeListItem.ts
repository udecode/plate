import {
  deleteMerge,
  getPluginType,
  getPreviousPath,
  insertNodes,
  isExpanded,
  PlateEditor,
  TElement,
  TNodeEntry,
  Value,
} from '@udecode/plate-core';
import { Editor, Path, Transforms } from 'slate';
import { ELEMENT_LI, ELEMENT_LIC } from '../createListPlugin';
import { hasListChild } from '../queries/hasListChild';
import { moveListItemsToList } from './moveListItemsToList';
import { moveListItemSublistItemsToListItemSublist } from './moveListItemSublistItemsToListItemSublist';

export interface RemoveListItemOptions {
  list: TNodeEntry<TElement>;
  listItem: TNodeEntry<TElement>;
  reverse?: boolean;
}

/**
 * Remove list item and move its sublist to list if any.
 */
export const removeListItem = <V extends Value>(
  editor: PlateEditor<V>,
  { list, listItem, reverse = true }: RemoveListItemOptions
) => {
  const [liNode, liPath] = listItem;

  // Stop if the list item has no sublist
  if (isExpanded(editor.selection) || !hasListChild(editor, liNode)) {
    return false;
  }

  const previousLiPath = getPreviousPath(liPath);

  let success = false;

  Editor.withoutNormalizing(editor, () => {
    /**
     * If there is a previous li, we need to move sub-lis to the previous li.
     * As we need to delete first, we will:
     * 1. insert a temporary li: tempLi
     * 2. move sub-lis to tempLi
     * 3. delete
     * 4. move sub-lis from tempLi to the previous li.
     * 5. remove tempLi
     */
    if (previousLiPath) {
      const previousLi = Editor.node(
        editor,
        previousLiPath
      ) as TNodeEntry<TElement>;

      // 1
      let tempLiPath = Path.next(liPath);
      insertNodes<TElement>(
        editor,
        {
          type: getPluginType(editor, ELEMENT_LI),
          children: [
            {
              type: getPluginType(editor, ELEMENT_LIC),
              children: [{ text: '' }],
            },
          ],
        },
        { at: tempLiPath }
      );

      const tempLi = Editor.node(editor, tempLiPath) as TNodeEntry<TElement>;
      const tempLiPathRef = Editor.pathRef(editor, tempLi[1]);

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
      Transforms.removeNodes(editor, { at: tempLiPath });

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
