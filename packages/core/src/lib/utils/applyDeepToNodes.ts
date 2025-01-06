import {
  type NodeEntry,
  type NodeOf,
  type Path,
  type QueryNodeOptions,
  type TNode,
  NodeApi,
  queryNode,
} from '@udecode/slate';

export interface ApplyDeepToNodesOptions<N extends TNode> {
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
}

/** Recursively apply an operation to children nodes with a query. */
export const applyDeepToNodes = <N extends TNode>({
  apply,
  node,
  path = [],
  query,
  source,
}: ApplyDeepToNodesOptions<N>) => {
  const entry: NodeEntry<N> = [node, path];

  if (queryNode<N>(entry, query)) {
    if (source instanceof Function) {
      apply(node, source());
    } else {
      apply(node, source);
    }
  }
  if (!NodeApi.isAncestor(node)) return;

  node.children.forEach((child, index) => {
    applyDeepToNodes({
      apply,
      node: child as any,
      path: path.concat([index]),
      query,
      source,
    });
  });
};
