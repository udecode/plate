import { Node, NodeEntry, Path } from 'slate';

/**
 * Get children node entries of a node entry.
 * TODO: try Node.children
 */
export const getChildren = (nodeEntry: NodeEntry) => {
  const [node, path] = nodeEntry;

  const children = (node.children as Node[]) || [];

  return children.map((child, index) => {
    const childPath = path.concat([index]) as Path;
    return [child, childPath] as NodeEntry;
  });
};
