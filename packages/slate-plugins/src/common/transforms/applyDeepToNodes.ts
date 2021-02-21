import { Descendant, Node, NodeEntry } from 'slate';
import { isAncestor, queryNode } from '../queries';
import { QueryNodeOptions } from '../types/QueryNodeOptions';

export interface ApplyDeepToNodesOptions {
  // The destination node object.
  node: Node;
  // The source object. Can be a factory.
  source: Record<string, any> | (() => Record<string, any>);
  // Function to call on each node following the query.
  apply: (
    node: Node,
    source: Record<string, any> | (() => Record<string, any>)
  ) => void;
  // Query to filter the nodes.
  query?: QueryNodeOptions;
}

/**
 * Recursively apply an operation to children nodes with a query.
 */
export const applyDeepToNodes = ({
  node,
  source,
  apply,
  query,
}: ApplyDeepToNodesOptions) => {
  const entry: NodeEntry<Node> = [node, []];

  if (queryNode(entry, query)) {
    if (source instanceof Function) {
      apply(node, source());
    } else {
      apply(node, source);
    }
  }

  if (!isAncestor(node)) return;

  node.children.forEach((child: Descendant) => {
    applyDeepToNodes({ node: child, source, apply, query });
  });
};
