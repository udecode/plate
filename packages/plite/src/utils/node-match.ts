import {
  type Node,
  NodeApi,
  type NodeMatch,
  type NodeMatchPredicate,
} from '../interfaces/node';

export const normalizeNodeMatch = <T extends Node>(
  match: NodeMatch<T> | undefined
): NodeMatchPredicate<T> | undefined => {
  if (!match) return;

  return (node, path) => NodeApi.matches(node, match, path);
};
