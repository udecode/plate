import { Node } from 'slate';
import { TNode, TNodeProps } from './TNode';

/**
 * Extract the custom properties from a node.
 */
export const getNodeProps = <N extends TNode>(node: N) =>
  Node.extractProps(node) as TNodeProps<N>;
