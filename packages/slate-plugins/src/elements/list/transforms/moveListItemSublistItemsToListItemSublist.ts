import { Ancestor, Editor, NodeEntry, Path, Transforms } from 'slate';
import { findDescendant } from '../../../common/queries/findDescendant';
import { getLastChildPath } from '../../../common/queries/getLastChild';
import { getParent } from '../../../common/queries/getParent';
import { moveChildren } from '../../../common/transforms/moveChildren';
import { getListTypes } from '../queries/getListTypes';
import { ListOptions } from '../types';

export interface MoveListItemSublistItemsToListItemSublistOptions {
  /**
   * The list item to merge.
   */
  fromListItem: NodeEntry<Ancestor>;

  /**
   * The list item where to merge.
   */
  toListItem: NodeEntry<Ancestor>;

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
  editor: Editor,
  {
    fromListItem,
    toListItem,
    start,
  }: MoveListItemSublistItemsToListItemSublistOptions,
  options?: ListOptions
) => {
  const [, fromListItemPath] = fromListItem;
  const [, toListItemPath] = toListItem;

  const fromListItemSublist = findDescendant<Ancestor>(editor, {
    at: fromListItemPath,
    match: {
      type: getListTypes(options),
    },
  });
  if (!fromListItemSublist) return 0;

  const [, fromListItemSublistPath] = fromListItemSublist;

  const toListItemSublist = findDescendant<Ancestor>(editor, {
    at: toListItemPath,
    match: {
      type: getListTypes(options),
    },
  });

  let to: Path;

  if (!toListItemSublist) {
    const fromList = getParent(editor, fromListItemPath);
    if (!fromList) return 0;
    const [fromListNode] = fromList;

    const fromListType = fromListNode.type;

    const toListItemSublistPath = toListItemPath.concat([1]);

    Transforms.insertNodes(
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

  const moved = moveChildren(editor, {
    at: fromListItemSublistPath,
    to,
  });

  // Remove the empty list
  Transforms.delete(editor, { at: fromListItemSublistPath });

  return moved;
};
