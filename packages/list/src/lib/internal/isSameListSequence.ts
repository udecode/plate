import type { Descendant, Element } from '@platejs/slate';
import type { SlateEditor } from 'platejs';

import { KEYS } from 'platejs';

import type { GetSiblingListOptions } from '../queries/getSiblingList';

const getHeadingType = (editor: SlateEditor, headingKey: string) => {
  const getType = (editor as any).getType;

  return typeof getType === 'function'
    ? getType.call(editor, headingKey)
    : headingKey;
};

const isHeadingListNode = (editor: SlateEditor, node: Descendant) => {
  const type = (node as any).type;

  return (
    typeof type === 'string' &&
    KEYS.heading.some(
      (headingKey) => type === getHeadingType(editor, headingKey)
    )
  );
};

export const isSameListSequence = (
  editor: SlateEditor,
  siblingNode: Descendant,
  currentNode: Descendant
) =>
  (siblingNode as any)[KEYS.listType] === (currentNode as any)[KEYS.listType] &&
  isHeadingListNode(editor, siblingNode) ===
    isHeadingListNode(editor, currentNode);

export const isListSequenceBoundary = (
  editor: SlateEditor,
  siblingNode: Descendant,
  currentNode: Descendant
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

export const getListSequenceSiblingOptions = <N extends Element = Element>(
  editor: SlateEditor,
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
