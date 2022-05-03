import { Node, Path } from 'slate';
import { NodeOf, TNode } from '../types/TNode';
import { TNodeEntry } from '../types/TNodeEntry';

/**
 * Get an entry for the common ancesetor node of two paths.
 */
export const getCommonNode = <N extends TNode>(
  root: N,
  path: Path,
  another: Path
) => Node.common(root, path, another) as TNodeEntry<NodeOf<N>>;
