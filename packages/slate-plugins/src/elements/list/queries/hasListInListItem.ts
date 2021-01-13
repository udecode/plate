import { Ancestor } from 'slate';
import { ListOptions } from '../types';
import { isNodeTypeList } from './isNodeTypeList';

/**
 * Is there a list in `listItemNode`.
 */
export const hasListInListItem = (
  listItemNode: Ancestor,
  options?: ListOptions
) => listItemNode.children.some((n) => isNodeTypeList(n, options));
