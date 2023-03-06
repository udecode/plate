import { isAncestor, NodeOf, TNode, TNodeEntry } from '@udecode/slate';
import { Path } from 'slate';
import { queryNode } from '../queries';
import { QueryNodeOptions } from '../types/QueryNodeOptions';

export interface ApplyDeepToNodesOptions<N extends TNode> {
  // The destination node object.
  node: N;
  path?: Path;
  // The source object. Can be a factory.
  source: Record<string, any> | (() => Record<string, any>);
  // Function to call on each node following the query.
  apply: (
    node: NodeOf<N>,
    source: Record<string, any> | (() => Record<string, any>)
  ) => void;
  // Query to filter the nodes.
  query?: QueryNodeOptions;
}

/**
 * Recursively apply an operation to children nodes with a query.
 */
export const applyDeepToNodes = <N extends TNode>({
  node,
  path = [],
  source,
  apply,
  query,
}: ApplyDeepToNodesOptions<N>) => {
  const entry: TNodeEntry<N> = [node, path];

  if (queryNode<N>(entry, query)) {
    if (source instanceof Function) {
      apply(node, source());
    } else {
      apply(node, source);
    }
  }

  if (!isAncestor(node)) return;

  node.children.forEach((child, index) => {
    applyDeepToNodes({
      node: child as any,
      path: path.concat([index]),
      source,
      apply,
      query,
    });
  });
};
