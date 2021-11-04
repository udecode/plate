import {
  findDescendant,
  getLastChildPath,
  getParent,
  insertNodes,
  moveChildren,
} from '@udecode/plate-common';
import { PlateEditor, TElement, TPlateEditor } from '@udecode/plate-core';
import { Editor, NodeEntry, Path, Transforms } from 'slate';
import { getListTypes } from '../queries/getListTypes';

export interface MoveListItemSublistItemsToListItemSublistOptions {
  /**
   * The list item to merge.
   */
  fromListItem: NodeEntry<TElement>;

  /**
   * The list item where to merge.
   */
  toListItem: NodeEntry<TElement>;

  /**
   * Move to the start of the list instead of the end.
   */
  start?: boolean;
}

/**
 * Move fromListItem sublist list items to the end of `toListItem` sublist.
 * If there is no `toListItem` sublist, insert one.
 */
export const moveListItemSublistItemsToListItemSublist = (
  editor: PlateEditor,
  {
    fromListItem,
    toListItem,
    start,
  }: MoveListItemSublistItemsToListItemSublistOptions
) => {
  const [, fromListItemPath] = fromListItem;
  const [, toListItemPath] = toListItem;
  let moved = 0;

  Editor.withoutNormalizing(editor, () => {
    const fromListItemSublist = findDescendant<TElement>(editor, {
      at: fromListItemPath,
      match: {
        type: getListTypes(editor),
      },
    });
    if (!fromListItemSublist) return 0;

    const [, fromListItemSublistPath] = fromListItemSublist;

    const toListItemSublist = findDescendant<TElement>(editor, {
      at: toListItemPath,
      match: {
        type: getListTypes(editor),
      },
    });

    let to: Path;

    if (!toListItemSublist) {
      const fromList = getParent(editor, fromListItemPath);
      if (!fromList) return 0;
      const [fromListNode] = fromList;

      const fromListType = fromListNode.type;

      const toListItemSublistPath = toListItemPath.concat([1]);

      insertNodes<TElement>(
        editor,
        { type: fromListType, children: [] },
        { at: toListItemSublistPath }
      );

      to = toListItemSublistPath.concat([0]);
    } else if (start) {
      const [, toListItemSublistPath] = toListItemSublist;
      to = toListItemSublistPath.concat([0]);
    } else {
      to = Path.next(getLastChildPath(toListItemSublist));
    }

    moved = moveChildren(editor, {
      at: fromListItemSublistPath,
      to,
    });

    // Remove the empty list
    Transforms.delete(editor, { at: fromListItemSublistPath });
  });

  return moved;
};
