import {
  type Descendant,
  NodeApi,
  type NodeMatch,
  type NodeOf,
  type Path,
} from '../../facade';

export type ApplyDeepToNodesOptions<N extends Descendant> = {
  // Function to call on each node following the query.
  apply: (
    node: NodeOf<N>,
    source: (() => Record<string, unknown>) | Record<string, unknown>
  ) => void;
  // The destination node object.
  node: N;
  // Match nodes to update.
  match?: NodeMatch<N>;
  // The source object. Can be a factory.
  source: (() => Record<string, unknown>) | Record<string, unknown>;
  path?: Path;
};

/** Recursively apply a transform to child nodes matching a query. */
export const applyDeepToNodes = <N extends Descendant>({
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
