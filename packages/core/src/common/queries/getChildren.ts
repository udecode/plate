import { NodeEntry, Path } from 'slate';
import { TDescendant } from '../../types/slate/TDescendant';
import { TNode } from '../../types/slate/TNode';

/**
 * Get children node entries of a node entry.
 * TODO: try Node.children
 */
export const getChildren = <T extends TNode = TNode>(
  nodeEntry: NodeEntry<T>
) => {
  const [node, path] = nodeEntry;

  const children: TNode[] = node.children || [];

  return children.map((child, index) => {
    const childPath: Path = path.concat([index]);
    return [child, childPath] as NodeEntry<TDescendant>;
  });
};
