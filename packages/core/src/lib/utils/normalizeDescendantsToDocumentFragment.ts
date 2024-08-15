import {
  type TDescendant,
  type TEditor,
  isElement,
  isText,
} from '@udecode/slate';

import type { PlateEditor } from '../editor';

import { ParagraphPlugin } from '../plugins';

const isInlineNode =
  (editor: Pick<TEditor, 'isInline'>) => (node: TDescendant) =>
    isText(node) || (isElement(node) && editor.isInline(node));

const makeBlockLazy = (type: string) => (): TDescendant => ({
  children: [],
  type,
});

const hasDifferentChildNodes = (
  descendants: TDescendant[],
  isInline: (node: TDescendant) => boolean
): boolean => {
  return descendants.some((descendant, index, arr) => {
    const prevDescendant = arr[index - 1];

    if (index !== 0) {
      return isInline(descendant) !== isInline(prevDescendant);
    }

    return false;
  });
};

/**
 * Handles 3rd constraint: "Block nodes can only contain other blocks, or inline
 * and text nodes."
 */
const normalizeDifferentNodeTypes = (
  descendants: TDescendant[],
  isInline: (node: TDescendant) => boolean,
  makeDefaultBlock: () => TDescendant
): TDescendant[] => {
  const hasDifferentNodes = hasDifferentChildNodes(descendants, isInline);

  const { fragment } = descendants.reduce(
    (memo, node) => {
      if (hasDifferentNodes && isInline(node)) {
        let block = memo.precedingBlock;

        if (!block) {
          block = makeDefaultBlock();
          memo.precedingBlock = block;
          memo.fragment.push(block);
        }

        (block.children as TDescendant[]).push(node);
      } else {
        memo.fragment.push(node);
        memo.precedingBlock = null;
      }

      return memo;
    },
    {
      fragment: [] as TDescendant[],
      precedingBlock: null as TDescendant | null,
    }
  );

  return fragment;
};

/**
 * Handles 1st constraint: "All Element nodes must contain at least one Text
 * descendant."
 */
const normalizeEmptyChildren = (descendants: TDescendant[]): TDescendant[] => {
  if (descendants.length === 0) {
    return [{ text: '' } as TDescendant];
  }

  return descendants;
};

const normalize = (
  descendants: TDescendant[],
  isInline: (node: TDescendant) => boolean,
  makeDefaultBlock: () => TDescendant
): TDescendant[] => {
  descendants = normalizeEmptyChildren(descendants);
  descendants = normalizeDifferentNodeTypes(
    descendants,
    isInline,
    makeDefaultBlock
  );

  descendants = descendants.map((node) => {
    if (isElement(node)) {
      return {
        ...node,
        children: normalize(
          node.children as TDescendant[],
          isInline,
          makeDefaultBlock
        ),
      };
    }

    return node;
  });

  return descendants;
};

/** Normalize the descendants to a valid document fragment. */
export const normalizeDescendantsToDocumentFragment = (
  editor: PlateEditor,
  { descendants }: { descendants: TDescendant[] }
): TDescendant[] => {
  const isInline = isInlineNode(editor);
  const defaultType = editor.getType(ParagraphPlugin);
  const makeDefaultBlock = makeBlockLazy(defaultType);

  return normalize(descendants, isInline, makeDefaultBlock as any);
};
