import { findParentNodeClosestToPos } from './findParentNodeClosestToPos';

/**
 * Find the closest parent node to the current selection that matches a predicate.
 * @param predicate Predicate to match.
 * @returns Command that finds the closest parent node.
 *
 * https://github.com/atlassian/prosemirror-utils/blob/master/src/selection.ts#L17
 */
export const findParentNode = (predicate) => {
  return ({ $from }) => findParentNodeClosestToPos($from, predicate);
};
