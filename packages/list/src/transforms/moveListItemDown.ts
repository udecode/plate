import {
  type PlateEditor,
  type TElement,
  type TElementEntry,
  getNodeEntry,
  match,
  moveNodes,
  withoutNormalizing,
  wrapNodes,
} from '@udecode/plate-common';
import { Path } from 'slate';

import { getListTypes } from '../queries/index';

export interface MoveListItemDownOptions {
  list: TElementEntry;
  listItem: TElementEntry;
}

export const moveListItemDown = (
  editor: PlateEditor,
  { list, listItem }: MoveListItemDownOptions
) => {
  let moved = false;

  const [listNode] = list;
  const [, listItemPath] = listItem;

  let previousListItemPath: Path;

  try {
    previousListItemPath = Path.previous(listItemPath);
  } catch (error) {
    return;
  }

  // Previous sibling is the new parent
  const previousSiblingItem = getNodeEntry<TElement>(
    editor,
    previousListItemPath
  );

  if (previousSiblingItem) {
    const [previousNode, previousPath] = previousSiblingItem;

    const sublist = (previousNode.children as TElement[]).find((n) =>
      match(n, [], { type: getListTypes(editor) })
    );
    const newPath = previousPath.concat(
      sublist ? [1, sublist.children.length] : [1]
    );

    withoutNormalizing(editor, () => {
      if (!sublist) {
        // Create new sublist
        wrapNodes<TElement>(
          editor,
          { children: [], type: listNode.type },
          { at: listItemPath }
        );
      }

      // Move the current item to the sublist
      moveNodes(editor, {
        at: listItemPath,
        to: newPath,
      });

      moved = true;
    });
  }

  return moved;
};
