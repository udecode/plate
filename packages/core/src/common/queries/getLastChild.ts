import { Path } from 'slate';
import { TAncestor } from '../../slate/types/TAncestor';
import { TDescendant } from '../../slate/types/TDescendant';
import { TNodeEntry } from '../../slate/types/TNodeEntry';

/**
 * Get the last child of a node or null if no children.
 */
export const getLastChild = (
  nodeEntry: TNodeEntry<TAncestor>
): TNodeEntry<TDescendant> | null => {
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
export const getLastChildPath = (nodeEntry: TNodeEntry<TAncestor>): Path => {
  const lastChild = getLastChild(nodeEntry);

  if (!lastChild) return nodeEntry[1].concat([-1]);

  return lastChild[1];
};

/**
 * Is the child path the last one of the parent.
 */
export const isLastChild = (
  parentEntry: TNodeEntry<TAncestor>,
  childPath: Path
): boolean => {
  const lastChildPath = getLastChildPath(parentEntry);

  return Path.equals(lastChildPath, childPath);
};
