import { ChildOf, isText, TNode, TNodeEntry } from '@udecode/slate';
import { Path } from 'slate';

/**
 * Get the last child of a node or null if no children.
 */
export const getLastChild = <N extends ChildOf<R>, R extends TNode>(
  nodeEntry: TNodeEntry<R>
): TNodeEntry<N> | null => {
  const [node, path] = nodeEntry;

  if (isText(node)) return null;
  if (!node.children.length) return null;

  const children = node.children as N[];

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
