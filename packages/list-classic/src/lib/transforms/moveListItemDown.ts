import type { BaseEditor } from '@platejs/core';
import {
  type Element,
  type ElementEntry,
  ElementApi,
  PathApi,
} from '@platejs/plite';

import type { ListTransaction } from '../BaseListPlugin';

import { getListTypes } from '../queries/index';

export type MoveListItemDownOptions = {
  list: ElementEntry;
  listItem: ElementEntry;
};

export const moveListItemDown = (
  editor: BaseEditor,
  tx: ListTransaction,
  { list, listItem }: MoveListItemDownOptions
) => {
  let moved = false;

  const [listNode] = list;
  const [, listItemPath] = listItem;

  const previousListItemPath = PathApi.previous(listItemPath);

  if (!previousListItemPath) {
    return;
  }

  // Previous sibling is the new parent
  const previousSiblingItem = editor.read.nodes.get(previousListItemPath);

  if (previousSiblingItem) {
    const [previousNode, previousPath] = previousSiblingItem;

    if (!ElementApi.isElement(previousNode)) return;

    const sublist = previousNode.children.find(
      (node): node is Element =>
        ElementApi.isElement(node) && getListTypes(editor).includes(node.type)
    );
    const newPath = previousPath.concat(
      sublist ? [1, sublist.children.length] : [1]
    );

    if (!sublist) {
      // Create new sublist
      tx.nodes.wrap(
        { children: [], type: listNode.type },
        { at: listItemPath }
      );
    }

    // Move the current item to the sublist
    tx.nodes.move({
      at: listItemPath,
      to: newPath,
    });

    moved = true;
  }

  return moved;
};
