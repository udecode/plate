import { Ancestor, Descendant, NodeEntry, Path } from 'slate';

/**
 * Get the last child of a node
 */
export const getLastChild = (
  nodeEntry: NodeEntry<Ancestor>
): NodeEntry<Descendant> => {
  const [node, path] = nodeEntry;

  return [
    node.children[node.children.length - 1],
    path.concat([node.children.length - 1]),
  ];
};

export const getLastChildPath = (nodeEntry: NodeEntry<Ancestor>): Path =>
  getLastChild(nodeEntry)[1];
