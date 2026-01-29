/**
 * Find children inside PM node that match a predicate.
 * @param node PM node to search in.
 * @param predicate The predicate to match.
 * @returns An array of nodes with their positions.
 */
export function findChildren(node, predicate) {
  const nodesWithPos = [];

  node.descendants((child, pos) => {
    if (predicate(child)) {
      nodesWithPos.push({
        node: child,
        pos,
      });
    }
  });

  return nodesWithPos;
}
