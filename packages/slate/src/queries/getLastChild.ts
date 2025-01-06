import type { Path } from '../interfaces/path';

import {
  type ChildOf,
  type NodeEntry,
  type TNode,
  PathApi,
  TextApi,
} from '../interfaces';

/** Get the last child of a node or null if no children. */
export const getLastChild = <N extends ChildOf<R>, R extends TNode>(
  nodeEntry: NodeEntry<R>
): NodeEntry<N> | null => {
  const [node, path] = nodeEntry;

  if (TextApi.isText(node)) return null;
  if (node.children.length === 0) return null;

  const children = node.children as N[];

  return [children.at(-1) as N, path.concat([children.length - 1])];
};

/** Get last child path. If there is no child, last index is 0. */
export const getLastChildPath = <N extends TNode>(
  nodeEntry: NodeEntry<N>
): Path => {
  const lastChild = getLastChild(nodeEntry);

  if (!lastChild) return nodeEntry[1].concat([-1]);

  return lastChild[1];
};

/** Is the child path the last one of the parent. */
export const isLastChild = <N extends TNode>(
  parentEntry: NodeEntry<N>,
  childPath: Path
): boolean => {
  const lastChildPath = getLastChildPath(parentEntry);

  return PathApi.equals(lastChildPath, childPath);
};
