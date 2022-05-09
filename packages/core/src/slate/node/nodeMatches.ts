import { Node } from 'slate';
import { TNode } from './TNode';

/**
 * Check if a node matches a set of props.
 */
export const nodeMatches = (node: TNode, props: object) =>
  Node.matches(node, props);
