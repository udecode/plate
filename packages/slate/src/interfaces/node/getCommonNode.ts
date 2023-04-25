import { Node, Path } from 'slate';
import { NodeOf, TNode } from './TNode';
import { TNodeEntry } from './TNodeEntry';

/**
 * Get an entry for the common ancesetor node of two paths.
 */
export const getCommonNode = <N extends NodeOf<R>, R extends TNode = TNode>(
  root: R,
  path: Path,
  another: Path
) => Node.common(root, path, another) as TNodeEntry<N>;
