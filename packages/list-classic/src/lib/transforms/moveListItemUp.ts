import type { SlateEditor } from '@platejs/core';
import type { Element, ElementEntry, Path } from '@platejs/slate';
import { PathApi } from '@platejs/slate';
import { KEYS } from '@platejs/utils';
import { runWithoutNormalizing } from '../internal/runWithoutNormalizing';

import { hasListChild } from '../queries/hasListChild';
import { moveListItemsToList } from './moveListItemsToList';
import { unwrapList } from './unwrapList';

export type MoveListItemUpOptions = {
  list: ElementEntry;
  listItem: ElementEntry;
};

const isLastChild = (editor: SlateEditor, path: Path) => {
  const index = path.at(-1);

  if (index == null) return false;

  const parentPath = PathApi.parent(path);
  const childCount =
    parentPath.length === 0
      ? editor.children.length
      : editor.api.node<Element>(parentPath)?.[0].children.length;

  return childCount != null && index === childCount - 1;
};

const getNextListPath = (listPath: Path, listItemPath: Path) => {
  if (listPath.length === 0) {
    const index = listItemPath.at(0);

    return index == null ? undefined : [index + 1];
  }

  try {
    return PathApi.next(listPath);
  } catch (_error) {
    return;
  }
};

/** Move a list item up. */
export const moveListItemUp = (
  editor: SlateEditor,
  { list, listItem }: MoveListItemUpOptions
) => {
  const move = () => {
    const [listNode, listPath] = list;
    const [liNode, liPath] = listItem;

    const liParent = editor.api.above<Element>({
      at: listPath,
      match: (node) => node.type === editor.getType(KEYS.li),
    });

    if (!liParent) {
      const condA = hasListChild(editor, liNode);
      const condB = !isLastChild(editor, liPath);

      if (condA || condB) {
        const toListPath = getNextListPath(listPath, liPath);

        if (!toListPath) return;

        // Insert a new list next to `list`
        editor.update((tx) => {
          tx.nodes.insert(
            {
              children: [],
              type: listNode.type,
            },
            { at: toListPath }
          );
        });

        if (condA) {
          const toListNode = editor.api.node<Element>(toListPath)?.[0];

          if (!toListNode) return;

          // Move li sub-lis to the new list
          moveListItemsToList(editor, {
            fromListItem: listItem,
            toList: [toListNode, toListPath],
          });
        }
        // If there is siblings li, move them to the new list
        if (condB) {
          const toListNode = editor.api.node<Element>(toListPath)?.[0];

          if (!toListNode) return;

          // Move next lis to the new list
          moveListItemsToList(editor, {
            deleteFromList: false,
            fromList: list,
            fromStartIndex: liPath.at(-1)! + 1,
            toList: [toListNode, toListPath],
          });
        }
      }

      // Finally, unwrap the list
      unwrapList(editor, { at: liPath.concat(0) });

      return true;
    }

    const [, liParentPath] = liParent;

    const toListPath = liPath.concat([1]);

    // If li has next siblings, we need to move them.
    if (!isLastChild(editor, liPath)) {
      // If li has no sublist, insert one.
      if (!hasListChild(editor, liNode)) {
        editor.update((tx) => {
          tx.nodes.insert(
            {
              children: [],
              type: listNode.type,
            },
            { at: toListPath }
          );
        });
      }

      const toListNode = editor.api.node<Element>(toListPath)?.[0];

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
    editor.update((tx) => {
      tx.nodes.move({
        at: liPath,
        to: movedUpLiPath,
      });
    });

    return true;
  };

  let moved: boolean | undefined = false;

  editor.update((tx) => {
    runWithoutNormalizing(tx, () => {
      moved = move();
    });
  });

  return moved;
};
