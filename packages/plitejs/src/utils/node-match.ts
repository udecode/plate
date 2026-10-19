import {
  type Node,
  NodeApi,
  type NodeMatch,
  type NodeMatchPredicate,
  type NodeTypeSelector,
} from '../interfaces/node';

export const normalizeNodeMatch = <T extends Node>(
  type: NodeTypeSelector | undefined,
  match: NodeMatch<T> | undefined
): NodeMatchPredicate<T> | undefined => {
  if (type === undefined) {
    return match as NodeMatchPredicate<T> | undefined;
  }

  const selectors = Array.isArray(type) ? type : [type];
  const types = new Set(
    selectors.map((selector) =>
      typeof selector === 'string' ? selector : selector.type
    )
  );

  return (node, path) =>
    NodeApi.isElement(node) &&
    types.has(node.type) &&
    (match?.(node as T, path) ?? true);
};
