import type { Descendant } from '@platejs/slate';

export type DOMStrategySegmentKind =
  | 'block-group'
  | 'list-subtree'
  | 'table-subtree'
  | 'void-embed';

const TABLE_TYPE_PATTERN = /(table|row|cell)/i;
const LIST_TYPE_PATTERN = /(list|item)/i;
const VOID_LIKE_TYPE_PATTERN = /(void|embed|image|media|video|iframe)/i;

const isText = (
  value: Descendant
): value is Extract<Descendant, { text: string }> =>
  typeof (value as { text?: unknown }).text === 'string';

const matchesType = (type: unknown, matcher: RegExp) =>
  typeof type === 'string' && matcher.test(type);

export const classifySegmentKind = (
  nodes: readonly Descendant[]
): DOMStrategySegmentKind => {
  let sawList = false;
  let sawTable = false;
  let sawVoidLike = false;

  const visit = (node: Descendant) => {
    if (isText(node)) {
      return;
    }

    if (matchesType((node as { type?: unknown }).type, TABLE_TYPE_PATTERN)) {
      sawTable = true;
    }

    if (matchesType((node as { type?: unknown }).type, LIST_TYPE_PATTERN)) {
      sawList = true;
    }

    if (
      matchesType((node as { type?: unknown }).type, VOID_LIKE_TYPE_PATTERN)
    ) {
      sawVoidLike = true;
    }

    node.children.forEach(visit);
  };

  nodes.forEach(visit);

  if (sawTable) {
    return 'table-subtree';
  }

  if (sawVoidLike) {
    return 'void-embed';
  }

  if (sawList) {
    return 'list-subtree';
  }

  return 'block-group';
};
