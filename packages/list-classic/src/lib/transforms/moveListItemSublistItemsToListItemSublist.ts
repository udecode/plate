import type { ElementEntry, Path } from '@platejs/plite';
import type { BasePlateEditor } from '@platejs/core';
import { getEditorDescendant } from '../internal/editorQueries';
import { runWithoutNormalizing } from '../internal/runWithoutNormalizing';

import { getListTypes } from '../queries/getListTypes';

export type MoveListItemSublistItemsToListItemSublistOptions = {
  /** The list item to merge. */
  fromListItem: ElementEntry;

  /** The list item where to merge. */
  toListItem: ElementEntry;

  /** Move to the start of the list instead of the end. */
  start?: boolean;
};

/**
 * Move fromListItem sublist list items to the end of `toListItem` sublist. If
 * there is no `toListItem` sublist, insert one.
 */
export const moveListItemSublistItemsToListItemSublist = (
  editor: BasePlateEditor,
  {
    fromListItem,
    start,
    toListItem,
  }: MoveListItemSublistItemsToListItemSublistOptions
) => {
  const [, fromListItemPath] = fromListItem;
  const [, toListItemPath] = toListItem;
  let moved: boolean | void = false;

  editor.update((tx) => {
    runWithoutNormalizing(tx, () => {
      const fromListItemSublist = getEditorDescendant(editor, {
        at: fromListItemPath,
        match: (node) => getListTypes(editor).includes(node.type),
      });

      if (!fromListItemSublist) return;

      const [, fromListItemSublistPath] = fromListItemSublist;

      const toListItemSublist = getEditorDescendant(editor, {
        at: toListItemPath,
        match: (node) => getListTypes(editor).includes(node.type),
      });

      let to: Path;

      if (!toListItemSublist) {
        const fromList = editor.api.parent(fromListItemPath);

        if (!fromList) return;

        const [fromListNode] = fromList;

        const fromListType = fromListNode.type;

        const toListItemSublistPath = toListItemPath.concat([1]);

        tx.nodes.insert(
          { children: [], type: fromListType as string },
          { at: toListItemSublistPath }
        );

        to = toListItemSublistPath.concat([0]);
      } else if (start) {
        const [, toListItemSublistPath] = toListItemSublist;
        to = toListItemSublistPath.concat([0]);
      } else {
        to = toListItemSublist[1].concat([
          toListItemSublist[0].children.length,
        ]);
      }

      for (
        let index = fromListItemSublist[0].children.length - 1;
        index >= 0;
        index--
      ) {
        tx.nodes.move({
          at: [...fromListItemSublistPath, index],
          to,
        });
        moved = true;
      }

      // Remove the empty list
      tx.nodes.remove({ at: fromListItemSublistPath });
    });
  });

  return moved;
};
