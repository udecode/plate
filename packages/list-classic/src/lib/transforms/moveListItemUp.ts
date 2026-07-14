import type { BaseEditor } from '@platejs/core';
import {
  type Element,
  type ElementEntry,
  type Path,
  PathApi,
} from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import type { ListTransaction } from '../BaseListPlugin';

import { hasListChild } from '../queries/hasListChild';
import { moveListItemsToList } from './moveListItemsToList';
import { unwrapList } from './unwrapList';

export type MoveListItemUpOptions = {
  list: ElementEntry;
  listItem: ElementEntry;
};

/** Move a list item up. */
export const moveListItemUp = (
  editor: BaseEditor,
  tx: ListTransaction,
  { list, listItem }: MoveListItemUpOptions
) => {
  const move = () => {
    const [listNode, listPath] = list;
    const [liNode, liPath] = listItem;

    const liParent = editor.read.nodes.above<Element>({
      at: listPath,
      match: { type: editor.getType(KEYS.li) },
    });

    if (!liParent) {
      let toListPath: Path;

      try {
        toListPath = PathApi.next(listPath);
      } catch (_error) {
        return;
      }

      const condA = hasListChild(editor, liNode);
      const listParent = editor.read.nodes.parent<Element>(liPath);
      const condB =
        !!listParent && liPath.at(-1)! < listParent[0].children.length - 1;

      if (condA || condB) {
        // Insert a new list next to `list`
        tx.nodes.insert(
          {
            children: [],
            type: listNode.type,
          },
          { at: toListPath }
        );
      }
      if (condA) {
        const toListNode = editor.read.nodes.get<Element>(toListPath)?.[0];

        if (!toListNode) return;

        // Move li sub-lis to the new list
        moveListItemsToList(editor, tx, {
          fromListItem: listItem,
          toList: [toListNode, toListPath],
        });
      }
      // If there is siblings li, move them to the new list
      if (condB) {
        const toListNode = editor.read.nodes.get<Element>(toListPath)?.[0];

        if (!toListNode) return;

        // Move next lis to the new list
        moveListItemsToList(editor, tx, {
          deleteFromList: false,
          fromList: list,
          fromStartIndex: liPath.at(-1)! + 1,
          toList: [toListNode, toListPath],
        });
      }

      // Finally, unwrap the list
      unwrapList(editor, tx, { at: liPath.concat(0) });

      return true;
    }

    const [, liParentPath] = liParent;

    const toListPath = liPath.concat([1]);

    // If li has next siblings, we need to move them.
    const listParent = editor.read.nodes.parent<Element>(liPath);

    if (listParent && liPath.at(-1)! < listParent[0].children.length - 1) {
      // If li has no sublist, insert one.
      if (!hasListChild(editor, liNode)) {
        tx.nodes.insert(
          {
            children: [],
            type: listNode.type,
          },
          { at: toListPath }
        );
      }

      const toListNode = editor.read.nodes.get<Element>(toListPath)?.[0];

      if (!toListNode) return;

      // Move next siblings to li sublist.
      moveListItemsToList(editor, tx, {
        deleteFromList: false,
        fromListItem: liParent,
        fromStartIndex: liPath.at(-1)! + 1,
        toList: [toListNode, toListPath],
      });
    }

    const movedUpLiPath = PathApi.next(liParentPath);

    // Move li one level up: next to the li parent.
    tx.nodes.move({
      at: liPath,
      to: movedUpLiPath,
    });

    return true;
  };

  return move();
};
