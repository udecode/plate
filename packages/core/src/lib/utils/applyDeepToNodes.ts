import type { Node, NodeEntry, NodeOf, Path } from '@platejs/plite';

import { type QueryNodeOptions, queryNode } from './queryNode';

export type ApplyDeepToNodesOptions<N extends Node> = {
  // Function to call on each node following the query.
  apply: (
    node: NodeOf<N>,
    source: (() => Record<string, any>) | Record<string, any>
  ) => void;
  // The destination node object.
  node: N;
  // The source object. Can be a factory.
  source: (() => Record<string, any>) | Record<string, any>;
  path?: Path;
  // Query to filter the nodes.
  query?: QueryNodeOptions;
};

/** Recursively apply an operation to children nodes with a query. */
export const applyDeepToNodes = <N extends Node>({
  apply,
  node,
  path = [],
  query,
  source,
}: ApplyDeepToNodesOptions<N>) => {
  const entry: NodeEntry<N> = [node, path];

  if (queryNode<N>(entry, query)) {
    if (typeof source === 'function') {
      apply(node, source());
    } else {
      apply(node, source);
    }
  }
  if (!('children' in node) || !Array.isArray(node.children)) return;

  node.children.forEach((child: Node, index) => {
    applyDeepToNodes({
      apply,
      node: child as any,
      path: path.concat([index]),
      query,
      source,
    });
  });
};
