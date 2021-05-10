import { Node, Text } from 'slate';

export const hasSingleChild = (node: Node): boolean => {
  if (Text.isText(node)) {
    return true;
  }
  return node.children.length === 1 && hasSingleChild(node.children[0]);
};
