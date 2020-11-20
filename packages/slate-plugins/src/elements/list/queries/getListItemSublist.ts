import { Ancestor, NodeEntry } from 'slate';
import { ListOptions } from '../types';
import { hasListInListItem } from './hasListInListItem';

/**
 * Get the list inside listItem if existing.
 * It assumes this structure: ul>li>p+ul
 */
export const getListItemSublist = (
  listItem: NodeEntry<Ancestor>,
  options?: ListOptions
): NodeEntry<Ancestor> | undefined => {
  const [listItemNode, listItemPath] = listItem;

  if (hasListInListItem(listItemNode, options)) {
    return [listItemNode.children[1] as Ancestor, listItemPath.concat([1])];
  }
};
