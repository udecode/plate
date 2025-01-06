import type { Path } from '../interfaces/path';

import {
  type ChildOf,
  type NodeEntry,
  type TNode,
  NodeApi,
} from '../interfaces';

/** Get children node entries of a node entry. TODO: try NodeApi.children */
export const getChildren = <N extends ChildOf<R>, R extends TNode = TNode>(
  nodeEntry: NodeEntry<R>
): NodeEntry<N>[] => {
  const [node, path] = nodeEntry;

  if (NodeApi.isAncestor(node)) {
    const { children } = node;

    return children.map((child, index) => {
      const childPath: Path = path.concat([index]);

      return [child as N, childPath];
    });
  }

  return [];
};
