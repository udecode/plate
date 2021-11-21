import { NodeEntry, Path } from 'slate';
import { TAncestor } from '../../types/slate/TAncestor';
import { TDescendant } from '../../types/slate/TDescendant';

/**
 * Get the last child of a node or null if no children.
 */
export const getLastChild = (
  nodeEntry: NodeEntry<TAncestor>
): NodeEntry<TDescendant> | null => {
  const [node, path] = nodeEntry;

  if (!node.children.length) return null;

  return [
    node.children[node.children.length - 1],
    path.concat([node.children.length - 1]),
  ];
};

/**
 * Get last child path. If there is no child, last index is 0.
 */
export const getLastChildPath = (nodeEntry: NodeEntry<TAncestor>): Path => {
  const lastChild = getLastChild(nodeEntry);

  if (!lastChild) return nodeEntry[1].concat([-1]);

  return lastChild[1];
};

/**
 * Is the child path the last one of the parent.
 */
export const isLastChild = (
  parentEntry: NodeEntry<TAncestor>,
  childPath: Path
): boolean => {
  const lastChildPath = getLastChildPath(parentEntry);

  return Path.equals(lastChildPath, childPath);
};
