import {
  type NodeTextsOptions,
  type TNode,
  type TextOf,
  getNodeTexts,
} from '@udecode/slate';

/** Get the first text node from a node. */
export const getFirstNodeText = <N extends TextOf<R>, R extends TNode = TNode>(
  root: R,
  options?: NodeTextsOptions<N, R>
) => {
  const texts = getNodeTexts(root, options);
  const firstTextEntry = texts.next().value;

  return firstTextEntry ?? undefined;
};
