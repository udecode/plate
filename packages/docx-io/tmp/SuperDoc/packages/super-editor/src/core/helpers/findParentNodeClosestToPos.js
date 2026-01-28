/**
 * Finds the closest parent node to a resolved position that matches a predicate.
 * @param $pos Resolved position.
 * @param predicate Predicate to match.
 * @returns Closest parent node to the resolved position that matches the predicate.
 *
 * https://github.com/atlassian/prosemirror-utils/blob/master/src/selection.ts#L57
 */
export const findParentNodeClosestToPos = ($pos, predicate) => {
  for (let i = $pos.depth; i > 0; i--) {
    const node = $pos.node(i);
    if (predicate(node)) {
      return {
        pos: i > 0 ? $pos.before(i) : 0,
        start: $pos.start(i),
        depth: i,
        node,
      };
    }
  }
};
