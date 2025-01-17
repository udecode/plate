import {
  type Descendant,
  type Editor,
  ElementApi,
  TextApi,
} from '@udecode/slate';

import type { SlateEditor } from '../editor';
import type { WithRequiredKey } from '../plugin';

import { BaseParagraphPlugin } from '../plugins';

const isInlineNode = (editor: Editor) => (node: Descendant) =>
  TextApi.isText(node) ||
  (ElementApi.isElement(node) && editor.api.isInline(node));

const makeBlockLazy = (type: string) => (): Descendant => ({
  children: [],
  type,
});

const hasDifferentChildNodes = (
  descendants: Descendant[],
  isInline: (node: Descendant) => boolean
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
  descendants: Descendant[],
  isInline: (node: Descendant) => boolean,
  makeDefaultBlock: () => Descendant
): Descendant[] => {
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

        (block.children as Descendant[]).push(node);
      } else {
        memo.fragment.push(node);
        memo.precedingBlock = null;
      }

      return memo;
    },
    {
      fragment: [] as Descendant[],
      precedingBlock: null as Descendant | null,
    }
  );

  return fragment;
};

/**
 * Handles 1st constraint: "All Element nodes must contain at least one Text
 * descendant."
 */
const normalizeEmptyChildren = (descendants: Descendant[]): Descendant[] => {
  if (descendants.length === 0) {
    return [{ text: '' } as Descendant];
  }

  return descendants;
};

const normalize = (
  descendants: Descendant[],
  isInline: (node: Descendant) => boolean,
  makeDefaultBlock: () => Descendant
): Descendant[] => {
  descendants = normalizeEmptyChildren(descendants);
  descendants = normalizeDifferentNodeTypes(
    descendants,
    isInline,
    makeDefaultBlock
  );

  descendants = descendants.map((node) => {
    if (ElementApi.isElement(node)) {
      return {
        ...node,
        children: normalize(
          node.children as Descendant[],
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
  editor: SlateEditor,
  {
    defaultElementPlugin = BaseParagraphPlugin,
    descendants,
  }: { descendants: Descendant[]; defaultElementPlugin?: WithRequiredKey }
): Descendant[] => {
  const isInline = isInlineNode(editor);
  const defaultType = editor.getType(defaultElementPlugin);
  const makeDefaultBlock = makeBlockLazy(defaultType);

  return normalize(descendants, isInline, makeDefaultBlock as any);
};
