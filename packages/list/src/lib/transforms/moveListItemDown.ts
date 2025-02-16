import {
  type ElementEntry,
  type SlateEditor,
  type TElement,
  match,
  PathApi,
} from '@udecode/plate';

import { getListTypes } from '../queries/index';

export interface MoveListItemDownOptions {
  list: ElementEntry;
  listItem: ElementEntry;
}

export const moveListItemDown = (
  editor: SlateEditor,
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
  const previousSiblingItem = editor.api.node(previousListItemPath);

  if (previousSiblingItem) {
    const [previousNode, previousPath] = previousSiblingItem;

    const sublist = (previousNode.children as TElement[]).find((n) =>
      match(n, [], { type: getListTypes(editor) })
    );
    const newPath = previousPath.concat(
      sublist ? [1, sublist.children.length] : [1]
    );

    editor.tf.withoutNormalizing(() => {
      if (!sublist) {
        // Create new sublist
        editor.tf.wrapNodes<TElement>(
          { children: [], type: listNode.type },
          { at: listItemPath }
        );
      }

      // Move the current item to the sublist
      editor.tf.moveNodes({
        at: listItemPath,
        to: newPath,
      });

      moved = true;
    });
  }

  return moved;
};
