import {
  deleteFragment,
  ELEMENT_DEFAULT,
  getPreviousPath,
  isExpanded,
} from '@udecode/slate-plugins-common';
import {
  getSlatePluginType,
  SPEditor,
  TElement,
} from '@udecode/slate-plugins-core';
import { Editor, NodeEntry, Path, Transforms } from 'slate';
import { ELEMENT_LI } from '../defaults';
import { hasListChild } from '../queries/hasListChild';
import { moveListItemsToList } from './moveListItemsToList';
import { moveListItemSublistItemsToListItemSublist } from './moveListItemSublistItemsToListItemSublist';

export interface RemoveListItemOptions {
  list: NodeEntry<TElement>;
  listItem: NodeEntry<TElement>;
}

/**
 * Remove list item and move its sublist to list if any.
 */
export const removeListItem = (
  editor: SPEditor,
  { list, listItem }: RemoveListItemOptions
) => {
  const [liNode, liPath] = listItem;

  // Stop if the list item has no sublist
  if (isExpanded(editor.selection) || !hasListChild(editor, liNode)) {
    return false;
  }

  const previousLiPath = getPreviousPath(liPath);

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
    ) as NodeEntry<TElement>;

    // 1
    let tempLiPath = Path.next(liPath);
    Transforms.insertNodes(
      editor,
      {
        type: getSlatePluginType(editor, ELEMENT_LI),
        children: [
          {
            type: getSlatePluginType(editor, ELEMENT_DEFAULT),
            children: [{ text: '' }],
          },
        ],
      } as any,
      { at: tempLiPath }
    );

    const tempLi = Editor.node(editor, tempLiPath) as NodeEntry<TElement>;
    const tempLiPathRef = Editor.pathRef(editor, tempLi[1]);

    // 2
    moveListItemSublistItemsToListItemSublist(editor, {
      fromListItem: listItem,
      toListItem: tempLi,
    });

    // 3
    deleteFragment(editor, {
      reverse: true,
    });

    tempLiPath = tempLiPathRef.unref()!;

    // 4
    moveListItemSublistItemsToListItemSublist(editor, {
      fromListItem: [tempLi[0], tempLiPath],
      toListItem: previousLi,
    });

    // 5
    Transforms.removeNodes(editor, { at: tempLiPath });

    return true;
  }

  // If it's the first li, move the sublist to the parent list
  moveListItemsToList(editor, {
    fromListItem: listItem,
    toList: list,
    toListIndex: 1,
  });
};
