import {
  type ElementEntry,
  type Path,
  type SlateEditor,
  type TElement,
  NodeApi,
  PathApi,
} from '@udecode/plate';

import { getListTypes } from '../queries/getListTypes';

export interface MoveListItemSublistItemsToListItemSublistOptions {
  /** The list item to merge. */
  fromListItem: ElementEntry;

  /** The list item where to merge. */
  toListItem: ElementEntry;

  /** Move to the start of the list instead of the end. */
  start?: boolean;
}

/**
 * Move fromListItem sublist list items to the end of `toListItem` sublist. If
 * there is no `toListItem` sublist, insert one.
 */
export const moveListItemSublistItemsToListItemSublist = (
  editor: SlateEditor,
  {
    fromListItem,
    start,
    toListItem,
  }: MoveListItemSublistItemsToListItemSublistOptions
) => {
  const [, fromListItemPath] = fromListItem;
  const [, toListItemPath] = toListItem;
  let moved: boolean | void = false;

  editor.tf.withoutNormalizing(() => {
    const fromListItemSublist = editor.api.descendant<TElement>({
      at: fromListItemPath,
      match: {
        type: getListTypes(editor),
      },
    });

    if (!fromListItemSublist) return;

    const [, fromListItemSublistPath] = fromListItemSublist;

    const toListItemSublist = editor.api.descendant<TElement>({
      at: toListItemPath,
      match: {
        type: getListTypes(editor),
      },
    });

    let to: Path;

    if (!toListItemSublist) {
      const fromList = editor.api.parent(fromListItemPath);

      if (!fromList) return;

      const [fromListNode] = fromList;

      const fromListType = fromListNode.type;

      const toListItemSublistPath = toListItemPath.concat([1]);

      editor.tf.insertNodes(
        { children: [], type: fromListType as string },
        { at: toListItemSublistPath }
      );

      to = toListItemSublistPath.concat([0]);
    } else if (start) {
      const [, toListItemSublistPath] = toListItemSublist;
      to = toListItemSublistPath.concat([0]);
    } else {
      to = PathApi.next(NodeApi.lastChild(editor, toListItemSublist[1])![1]);
    }

    moved = editor.tf.moveNodes({
      at: fromListItemSublistPath,
      children: true,
      to,
    });

    // Remove the empty list
    editor.tf.delete({ at: fromListItemSublistPath });
  });

  return moved;
};
