import type { BaseEditor } from '@platejs/core';
import type { Element } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import type { GetSiblingListOptions } from '../queries/getSiblingList';

const isHeadingListNode = (editor: BaseEditor, node: Element) =>
  KEYS.heading.some((headingKey) => node.type === editor.getType(headingKey));

export const isSameListSequence = (
  editor: BaseEditor,
  siblingNode: Element,
  currentNode: Element
) =>
  siblingNode[KEYS.listType] === currentNode[KEYS.listType] &&
  isHeadingListNode(editor, siblingNode) ===
    isHeadingListNode(editor, currentNode);

export const isListSequenceBoundary = (
  editor: BaseEditor,
  siblingNode: Element,
  currentNode: Element
) => {
  const siblingListType = siblingNode[KEYS.listType];

  return (
    siblingNode[KEYS.indent] === currentNode[KEYS.indent] &&
    siblingListType != null &&
    siblingListType === currentNode[KEYS.listType] &&
    isHeadingListNode(editor, siblingNode) !==
      isHeadingListNode(editor, currentNode)
  );
};

export const getListSequenceSiblingOptions = <N extends Element = Element>(
  editor: BaseEditor,
  options?: Partial<GetSiblingListOptions<N>>
): Partial<GetSiblingListOptions<N>> => {
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
