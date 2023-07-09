import { Node } from 'slate';

import { TNode } from './TNode';

/**
 * Get the concatenated text string of a node's content.
 *
 * Note that this will not include spaces or line breaks between block nodes.
 * It is not a user-facing string, but a string for performing offset-related
 * computations for a node.
 */
export const getNodeString = (node: TNode) => Node.string(node);
