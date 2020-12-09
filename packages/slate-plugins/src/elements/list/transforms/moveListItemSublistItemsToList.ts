import { Ancestor, Editor, NodeEntry, Path, Transforms } from 'slate';
import { getLastChildPath } from '../../../common/queries/getLastChild';
import { moveChildren } from '../../../common/transforms/moveChildren';
import { getListItemSublist } from '../queries/getListItemSublist';
import { ListOptions } from '../types';

export interface MergeListItemIntoListOptions {
  /**
   * List items of the sublist of this node will be moved.
   */
  fromListItem: NodeEntry<Ancestor>;

  /**
   * List items will be moved in this list.
   */
  toList: NodeEntry<Ancestor>;

  /**
   * Move to the start of the list instead of the end.
   */
  start?: boolean;
}

/**
 * Move the list items of the sublist of `fromListItem` to `toList`.
 */
export const moveListItemSublistItemsToList = (
  editor: Editor,
  { fromListItem, toList, start }: MergeListItemIntoListOptions,
  options: ListOptions
) => {
  const fromListItemSublist = getListItemSublist(fromListItem, options);
  if (!fromListItemSublist) return 0;

  const [, fromListItemSublistPath] = fromListItemSublist;
  const lastChildPath = getLastChildPath(toList);

  const moved = moveChildren(editor, {
    at: fromListItemSublistPath,
    to: start ? toList[1].concat([0]) : Path.next(lastChildPath),
  });

  // Remove the empty list
  Transforms.delete(editor, { at: fromListItemSublistPath });

  return moved;
};
