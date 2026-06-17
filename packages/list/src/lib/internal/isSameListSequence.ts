import { type Editor, type ElementOf, type TNode, KEYS } from 'platejs';

import type { GetSiblingListOptions } from '../queries/getSiblingList';

const getHeadingType = (editor: Editor, headingKey: string) => {
  const getType = (editor as any).getType;

  return typeof getType === 'function'
    ? getType.call(editor, headingKey)
    : headingKey;
};

const isHeadingListNode = (editor: Editor, node: TNode) => {
  const type = (node as any).type;

  return (
    typeof type === 'string' &&
    KEYS.heading.some(
      (headingKey) => type === getHeadingType(editor, headingKey)
    )
  );
};

export const isSameListSequence = (
  editor: Editor,
  siblingNode: TNode,
  currentNode: TNode
) =>
  (siblingNode as any)[KEYS.listType] === (currentNode as any)[KEYS.listType] &&
  isHeadingListNode(editor, siblingNode) ===
    isHeadingListNode(editor, currentNode);

export const isListSequenceBoundary = (
  editor: Editor,
  siblingNode: TNode,
  currentNode: TNode
) => {
  const siblingListType = (siblingNode as any)[KEYS.listType];

  return (
    (siblingNode as any)[KEYS.indent] === (currentNode as any)[KEYS.indent] &&
    siblingListType != null &&
    siblingListType === (currentNode as any)[KEYS.listType] &&
    isHeadingListNode(editor, siblingNode) !==
      isHeadingListNode(editor, currentNode)
  );
};

export const getListSequenceSiblingOptions = <
  N extends ElementOf<E>,
  E extends Editor = Editor,
>(
  editor: E,
  options?: Partial<GetSiblingListOptions<N, E>>
): Partial<GetSiblingListOptions<N, E>> => {
  const { breakQuery, query, ...rest } = options ?? {};

  return {
    ...rest,
    breakQuery: (siblingNode, currentNode) =>
      isListSequenceBoundary(editor, siblingNode, currentNode) ||
      !!breakQuery?.(siblingNode, currentNode),
    query: (siblingNode, currentNode) =>
      isSameListSequence(editor, siblingNode, currentNode) &&
      (query ? !!query(siblingNode, currentNode) : true),
  };
};
