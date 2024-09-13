import { type Path, Node } from 'slate';

import type { TNode } from './TNode';

/** Check if a descendant node exists at a specific path. */
export const hasNode = (root: TNode, path: Path) => Node.has(root, path);
