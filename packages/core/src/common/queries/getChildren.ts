import { Path } from 'slate';
import { isAncestor } from '../../slate/node/isAncestor';
import { TNode } from '../../slate/types/TNode';
import { TNodeChildEntry, TNodeEntry } from '../../slate/types/TNodeEntry';

/**
 * Get children node entries of a node entry.
 * TODO: try Node.children
 */
export const getChildren = <N extends TNode>(
  nodeEntry: TNodeEntry<N>
): TNodeChildEntry<N>[] => {
  const [node, path] = nodeEntry;

  if (isAncestor(node)) {
    const { children } = node;

    return children.map((child, index) => {
      const childPath: Path = path.concat([index]);
      return [child, childPath] as TNodeChildEntry<N>;
    });
  }

  return [];
};
