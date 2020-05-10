import { Ancestor, Descendant, Text } from 'slate';

/**
 * Has the node an empty text
 * TODO: try Node.string
 */
export const isBlockTextEmpty = (node: Ancestor) => {
  const lastChild: Descendant = node.children[node.children.length - 1];

  return Text.isText(lastChild) && !lastChild.text.length;
};
