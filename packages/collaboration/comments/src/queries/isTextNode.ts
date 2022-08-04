import { Node } from 'slate';

export function isTextNode(node: Node): boolean {
  return node.hasOwnProperty('text');
}
