import { Node } from 'slate';
import { TNode } from './TNode';

/**
 * Check if a value implements the `Node` interface.
 */
export const isNode = (value: any): value is TNode => Node.isNode(value);
