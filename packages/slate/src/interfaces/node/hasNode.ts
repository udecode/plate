import { Node, Path } from 'slate';

import { TNode } from './TNode';

/**
 * Check if a descendant node exists at a specific path.
 */
export const hasNode = (root: TNode, path: Path) => Node.has(root, path);
