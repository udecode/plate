import type { BasePlateEditor } from '@platejs/core';
import type { Element, ElementEntry } from '@platejs/plite';
import { runWithoutNormalizing } from '../internal/runWithoutNormalizing';

import { getListTypes, getPreviousSiblingPath } from '../queries/index';

export type MoveListItemDownOptions = {
  list: ElementEntry;
  listItem: ElementEntry;
};

export const moveListItemDown = (
  editor: BasePlateEditor,
  { list, listItem }: MoveListItemDownOptions
) => {
  let moved = false;

  const [listNode] = list;
  const [, listItemPath] = listItem;

  const previousListItemPath = getPreviousSiblingPath(listItemPath);

  if (!previousListItemPath) {
    return;
  }

  // Previous sibling is the new parent
  const previousSiblingItem = editor.api.node(previousListItemPath);

  if (previousSiblingItem) {
    const [previousNode, previousPath] = previousSiblingItem;

    const sublist = (previousNode.children as Element[]).find((node) =>
      getListTypes(editor).includes(node.type)
    );
    const newPath = previousPath.concat(
      sublist ? [1, sublist.children.length] : [1]
    );

    editor.update((tx) => {
      runWithoutNormalizing(tx, () => {
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
      });
    });
  }

  return moved;
};
