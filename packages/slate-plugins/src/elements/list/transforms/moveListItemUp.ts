import { Ancestor, Editor, NodeEntry, Path, Transforms } from 'slate';
import { getAbove } from '../../../common/queries/getAbove';
import { isLastChild } from '../../../common/queries/getLastChild';
import { getNode } from '../../../common/queries/getNode';
import { setDefaults } from '../../../common/utils/setDefaults';
import { DEFAULTS_LIST } from '../defaults';
import { hasListChild } from '../queries/hasListChild';
import { ListOptions } from '../types';
import { moveListItemsToList } from './moveListItemsToList';
import { unwrapList } from './unwrapList';

export interface MoveListItemUpOptions {
  list: NodeEntry<Ancestor>;
  listItem: NodeEntry<Ancestor>;
}

/**
 * Move a list item up.
 */
export const moveListItemUp = (
  editor: Editor,
  { list, listItem }: MoveListItemUpOptions,
  options?: ListOptions
) => {
  const move = () => {
    const { li } = setDefaults(options, DEFAULTS_LIST);

    const [listNode, listPath] = list;
    const [liNode, liPath] = listItem;

    const liParent = getAbove(editor, {
      at: listPath,
      match: { type: li.type },
    });
    if (!liParent) {
      const toListPath = Path.next(listPath);

      const condA = hasListChild(liNode, options);
      const condB = !isLastChild(list, liPath);

      if (condA || condB) {
        // Insert a new list next to `list`
        Transforms.insertNodes(
          editor,
          {
            type: listNode.type,
            children: [],
          },
          { at: toListPath }
        );
      }

      if (condA) {
        const toListNode = getNode(editor, toListPath) as Ancestor;
        if (!toListNode) return;

        // Move li sub-lis to the new list
        moveListItemsToList(
          editor,
          {
            fromListItem: listItem,
            toList: [toListNode, toListPath],
          },
          options
        );
      }

      // If there is siblings li, move them to the new list
      if (condB) {
        const toListNode = getNode(editor, toListPath) as Ancestor;
        if (!toListNode) return;

        // Move next lis to the new list
        moveListItemsToList(
          editor,
          {
            fromList: list,
            fromStartIndex: liPath[liPath.length - 1] + 1,
            toList: [toListNode, toListPath],
            deleteFromList: false,
          },
          options
        );
      }

      // Finally, unwrap the list
      unwrapList(editor, options);

      return true;
    }
    const [, liParentPath] = liParent;

    const toListPath = liPath.concat([1]);

    // If li has next siblings, we need to move them.
    if (!isLastChild(list, liPath)) {
      // If li has no sublist, insert one.
      if (!hasListChild(liNode, options)) {
        Transforms.insertNodes(
          editor,
          {
            type: listNode.type,
            children: [],
          },
          { at: toListPath }
        );
      }

      const toListNode = getNode(editor, toListPath) as Ancestor;
      if (!toListNode) return;

      // Move next siblings to li sublist.
      moveListItemsToList(
        editor,
        {
          fromListItem: liParent,
          toList: [toListNode, toListPath],
          fromStartIndex: liPath[liPath.length - 1] + 1,
          deleteFromList: false,
        },
        options
      );
    }

    const movedUpLiPath = Path.next(liParentPath);

    // Move li one level up: next to the li parent.
    Transforms.moveNodes(editor, {
      at: liPath,
      to: movedUpLiPath,
    });

    return true;
  };

  let moved: boolean | undefined = false;

  Editor.withoutNormalizing(editor, () => {
    moved = move();
  });

  return moved;
};
