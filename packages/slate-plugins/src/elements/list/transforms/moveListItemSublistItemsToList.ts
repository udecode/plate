import { Ancestor, Editor, NodeEntry, Path } from 'slate';
import { getLastChild } from '../../../common/queries/getLastChild';
import { moveChildren } from '../../../common/transforms/moveChildren';
import { getListItemSublist } from '../queries/getListItemSublist';

export interface MergeListItemIntoListOptions {
  /**
   * List items of the sublist of this node will be moved.
   */
  fromListItem: NodeEntry<Ancestor>;

  /**
   * List items will be moved in this list.
   */
  toList: NodeEntry<Ancestor>;
}

/**
 * Move the list items of the sublist of `fromListItem` to `toList`.
 */
export const moveListItemSublistItemsToList = (
  editor: Editor,
  { fromListItem, toList }: MergeListItemIntoListOptions
) => {
  const fromListItemSublist = getListItemSublist(fromListItem);
  if (!fromListItemSublist) return;

  const [, fromListItemSublistPath] = fromListItemSublist;
  const [, lastChildPath] = getLastChild(toList);

  moveChildren(editor, {
    at: fromListItemSublistPath,
    to: Path.next(lastChildPath),
  });
};
