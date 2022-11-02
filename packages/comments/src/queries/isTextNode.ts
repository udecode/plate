import { Node } from 'slate';

export const isTextNode = (node: Node) => {
  return node.hasOwnProperty('text');
};
