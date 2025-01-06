import {
  type NodeEntry,
  type NodeTextsOptions,
  type TNode,
  type TextOf,
  NodeApi,
} from '../interfaces';

/** Get the first text node from a node. */
export const getFirstNodeText = <N extends TextOf<R>, R extends TNode = TNode>(
  root: R,
  options?: NodeTextsOptions<R>
): NodeEntry<N> | undefined => {
  const texts = NodeApi.texts(root, options);
  const firstTextEntry = texts.next().value;

  return (firstTextEntry as any) ?? undefined;
};
