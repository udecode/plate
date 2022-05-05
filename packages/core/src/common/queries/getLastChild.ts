import { Path } from 'slate';
import { isText } from '../../slate/text/isText';
import { ChildOf } from '../../slate/types/TDescendant';
import { TNode } from '../../slate/types/TNode';
import { TNodeChildEntry, TNodeEntry } from '../../slate/types/TNodeEntry';

/**
 * Get the last child of a node or null if no children.
 */
export const getLastChild = <N extends TNode>(
  nodeEntry: TNodeEntry<N>
): TNodeChildEntry<N> | null => {
  const [node, path] = nodeEntry;

  if (isText(node)) return null;
  if (!node.children.length) return null;

  const children = node.children as ChildOf<N>[];

  return [children[children.length - 1], path.concat([children.length - 1])];
};

/**
 * Get last child path. If there is no child, last index is 0.
 */
export const getLastChildPath = <N extends TNode>(
  nodeEntry: TNodeEntry<N>
): Path => {
  const lastChild = getLastChild(nodeEntry);

  if (!lastChild) return nodeEntry[1].concat([-1]);

  return lastChild[1];
};

/**
 * Is the child path the last one of the parent.
 */
export const isLastChild = <N extends TNode>(
  parentEntry: TNodeEntry<N>,
  childPath: Path
): boolean => {
  const lastChildPath = getLastChildPath(parentEntry);

  return Path.equals(lastChildPath, childPath);
};
