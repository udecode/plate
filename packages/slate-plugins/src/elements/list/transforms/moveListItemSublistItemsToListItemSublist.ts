import { Ancestor, Editor, NodeEntry, Path, Transforms } from 'slate';
import { getLastChild } from '../../../common/queries/getLastChild';
import { getParent } from '../../../common/queries/getParent';
import { moveChildren } from '../../../common/transforms/moveChildren';
import { getListItemSublist } from '../queries/getListItemSublist';

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
  }: MoveListItemSublistItemsToListItemSublistOptions
) => {
  const [, fromListItemPath] = fromListItem;
  const [, toListItemPath] = toListItem;

  const fromListItemSublist = getListItemSublist(fromListItem);
  if (!fromListItemSublist) return;
  const [, fromListItemSublistPath] = fromListItemSublist;

  const toListItemSublist = getListItemSublist(toListItem);

  let to: Path;

  if (!toListItemSublist) {
    const fromList = getParent(editor, fromListItemPath);
    if (!fromList) return;
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
    const [, lastChildPath] = getLastChild(toListItemSublist);
    to = Path.next(lastChildPath);
  }

  moveChildren(editor, {
    at: fromListItemSublistPath,
    to,
  });
};
