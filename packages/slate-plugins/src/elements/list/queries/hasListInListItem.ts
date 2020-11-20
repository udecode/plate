import { Ancestor } from 'slate';
import { ListOptions } from '../types';
import { isNodeTypeList } from './isNodeTypeList';

/**
 * Is there a list in `listItemNode`. Assuming li>p+ul structure is used.
 */
export const hasListInListItem = (
  listItemNode: Ancestor,
  options?: ListOptions
) =>
  listItemNode.children.length > 1 &&
  isNodeTypeList(listItemNode.children[1], options);
