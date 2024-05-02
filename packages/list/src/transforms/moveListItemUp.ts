import {
  getAboveNode,
  getNode,
  getPluginType,
  insertElements,
  isLastChild,
  moveNodes,
  PlateEditor,
  TElement,
  TElementEntry,
  Value,
  withoutNormalizing,
} from '@udecode/plate-common/server';
import { Path } from 'slate';

import { ELEMENT_LI } from '../createListPlugin';
import { hasListChild } from '../queries/hasListChild';
import { moveListItemsToList } from './moveListItemsToList';
import { unwrapList } from './unwrapList';

export interface MoveListItemUpOptions {
  list: TElementEntry;
  listItem: TElementEntry;
}

/**
 * Move a list item up.
 */
export const moveListItemUp = <V extends Value>(
  editor: PlateEditor<V>,
  { list, listItem }: MoveListItemUpOptions
) => {
  const move = () => {
    const [listNode, listPath] = list;
    const [liNode, liPath] = listItem;

    const liParent = getAboveNode<TElement>(editor, {
      at: listPath,
      match: { type: getPluginType(editor, ELEMENT_LI) },
    });
    if (!liParent) {
      let toListPath;
      try {
        toListPath = Path.next(listPath);
      } catch (error) {
        return;
      }

      const condA = hasListChild(editor, liNode);
      const condB = !isLastChild(list, liPath);

      if (condA || condB) {
        // Insert a new list next to `list`
        insertElements(
          editor,
          {
            type: listNode.type,
            children: [],
          },
          { at: toListPath }
        );
      }

      if (condA) {
        const toListNode = getNode<TElement>(editor, toListPath);
        if (!toListNode) return;

        // Move li sub-lis to the new list
        moveListItemsToList(editor, {
          fromListItem: listItem,
          toList: [toListNode, toListPath],
        });
      }

      // If there is siblings li, move them to the new list
      if (condB) {
        const toListNode = getNode<TElement>(editor, toListPath);
        if (!toListNode) return;

        // Move next lis to the new list
        moveListItemsToList(editor, {
          fromList: list,
          fromStartIndex: liPath.at(-1)! + 1,
          toList: [toListNode, toListPath],
          deleteFromList: false,
        });
      }

      // Finally, unwrap the list
      unwrapList(editor, { at: liPath.concat(0) });

      return true;
    }
    const [, liParentPath] = liParent;

    const toListPath = liPath.concat([1]);

    // If li has next siblings, we need to move them.
    if (!isLastChild(list, liPath)) {
      // If li has no sublist, insert one.
      if (!hasListChild(editor, liNode)) {
        insertElements(
          editor,
          {
            type: listNode.type,
            children: [],
          },
          { at: toListPath }
        );
      }

      const toListNode = getNode<TElement>(editor, toListPath);
      if (!toListNode) return;

      // Move next siblings to li sublist.
      moveListItemsToList(editor, {
        fromListItem: liParent,
        toList: [toListNode, toListPath],
        fromStartIndex: liPath.at(-1)! + 1,
        deleteFromList: false,
      });
    }

    const movedUpLiPath = Path.next(liParentPath);

    // Move li one level up: next to the li parent.
    moveNodes(editor, {
      at: liPath,
      to: movedUpLiPath,
    });

    return true;
  };

  let moved: boolean | undefined = false;

  withoutNormalizing(editor, () => {
    moved = move();
  });

  return moved;
};
