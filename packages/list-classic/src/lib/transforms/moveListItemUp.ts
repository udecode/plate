import {
  type ElementEntry,
  type SlateEditor,
  type TElement,
  NodeApi,
  PathApi,
} from '@udecode/plate';

import { BaseListItemPlugin } from '../BaseListPlugin';
import { hasListChild } from '../queries/hasListChild';
import { moveListItemsToList } from './moveListItemsToList';
import { unwrapList } from './unwrapList';

export interface MoveListItemUpOptions {
  list: ElementEntry;
  listItem: ElementEntry;
}

/** Move a list item up. */
export const moveListItemUp = (
  editor: SlateEditor,
  { list, listItem }: MoveListItemUpOptions
) => {
  const move = () => {
    const [listNode, listPath] = list;
    const [liNode, liPath] = listItem;

    const liParent = editor.api.above<TElement>({
      at: listPath,
      match: { type: editor.getType(BaseListItemPlugin) },
    });

    if (!liParent) {
      let toListPath;

      try {
        toListPath = PathApi.next(listPath);
      } catch (error) {
        return;
      }

      const condA = hasListChild(editor, liNode);
      const condB = !NodeApi.isLastChild(editor, liPath);

      if (condA || condB) {
        // Insert a new list next to `list`
        editor.tf.insertNodes(
          {
            children: [],
            type: listNode.type,
          },
          { at: toListPath }
        );
      }
      if (condA) {
        const toListNode = NodeApi.get<TElement>(editor, toListPath);

        if (!toListNode) return;

        // Move li sub-lis to the new list
        moveListItemsToList(editor, {
          fromListItem: listItem,
          toList: [toListNode, toListPath],
        });
      }
      // If there is siblings li, move them to the new list
      if (condB) {
        const toListNode = NodeApi.get<TElement>(editor, toListPath);

        if (!toListNode) return;

        // Move next lis to the new list
        moveListItemsToList(editor, {
          deleteFromList: false,
          fromList: list,
          fromStartIndex: liPath.at(-1)! + 1,
          toList: [toListNode, toListPath],
        });
      }

      // Finally, unwrap the list
      unwrapList(editor, { at: liPath.concat(0) });

      return true;
    }

    const [, liParentPath] = liParent;

    const toListPath = liPath.concat([1]);

    // If li has next siblings, we need to move them.
    if (!NodeApi.isLastChild(editor, liPath)) {
      // If li has no sublist, insert one.
      if (!hasListChild(editor, liNode)) {
        editor.tf.insertNodes(
          {
            children: [],
            type: listNode.type,
          },
          { at: toListPath }
        );
      }

      const toListNode = NodeApi.get<TElement>(editor, toListPath);

      if (!toListNode) return;

      // Move next siblings to li sublist.
      moveListItemsToList(editor, {
        deleteFromList: false,
        fromListItem: liParent,
        fromStartIndex: liPath.at(-1)! + 1,
        toList: [toListNode, toListPath],
      });
    }

    const movedUpLiPath = PathApi.next(liParentPath);

    // Move li one level up: next to the li parent.
    editor.tf.moveNodes({
      at: liPath,
      to: movedUpLiPath,
    });

    return true;
  };

  let moved: boolean | undefined = false;

  editor.tf.withoutNormalizing(() => {
    moved = move();
  });

  return moved;
};
