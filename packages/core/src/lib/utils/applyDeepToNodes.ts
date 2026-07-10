import {
  NodeApi,
  type Node,
  type NodeMatch,
  type NodeOf,
  type Path,
} from '@platejs/plite';

export type ApplyDeepToNodesOptions<N extends Node> = {
  // Function to call on each node following the query.
  apply: (
    node: NodeOf<N>,
    source: (() => Record<string, any>) | Record<string, any>
  ) => void;
  // The destination node object.
  node: N;
  // Match nodes to update.
  match?: NodeMatch<N>;
  // The source object. Can be a factory.
  source: (() => Record<string, any>) | Record<string, any>;
  path?: Path;
};

/** Recursively apply an operation to children nodes with a query. */
export const applyDeepToNodes = <N extends Node>({
  apply,
  match,
  node,
  path = [],
  source,
}: ApplyDeepToNodesOptions<N>) => {
  if (!match || NodeApi.matches(node, match, path)) {
    if (typeof source === 'function') {
      apply(node, source());
    } else {
      apply(node, source);
    }
  }
  if (!NodeApi.isAncestor(node)) return;

  for (const [child, childPath] of NodeApi.children(node, [])) {
    applyDeepToNodes({
      apply,
      match,
      node: child as any,
      path: path.concat(childPath),
      source,
    });
  }
};
