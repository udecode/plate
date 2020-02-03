import { Ancestor } from 'slate';

/**
 * Has the node an empty text
 */
export const isBlockTextEmpty = (node: Ancestor) =>
  node.children && node.children[node.children.length - 1]?.text?.length === 0;
