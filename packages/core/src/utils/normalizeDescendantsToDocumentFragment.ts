import {
  EDescendant,
  isElement,
  isText,
  TDescendant,
  TEditor,
  Value,
} from '@udecode/slate';
import { ELEMENT_DEFAULT } from '../constants';
import { PlateEditor } from '../types/PlateEditor';
import { getPluginType } from './getPluginType';

const isInlineNode = <V extends Value>(
  editor: Pick<TEditor<V>, 'isInline'>
) => (node: EDescendant<V>) =>
  isText(node) || (isElement(node) && editor.isInline(node));

const makeBlockLazy = (type: string) => (): TDescendant => ({
  type,
  children: [],
});

const hasDifferentChildNodes = <N extends TDescendant>(
  descendants: N[],
  isInline: (node: N) => boolean
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
 * Handles 3rd constraint: "Block nodes can only contain other blocks, or inline and text nodes."
 */
const normalizeDifferentNodeTypes = <N extends TDescendant>(
  descendants: N[],
  isInline: (node: N) => boolean,
  makeDefaultBlock: () => N
): N[] => {
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
        (block.children as N[]).push(node);
      } else {
        memo.fragment.push(node);
        memo.precedingBlock = null;
      }

      return memo;
    },
    {
      fragment: [] as N[],
      precedingBlock: null as N | null,
    }
  );

  return fragment;
};

/**
 * Handles 1st constraint: "All Element nodes must contain at least one Text descendant."
 */
const normalizeEmptyChildren = <N extends TDescendant>(
  descendants: N[]
): N[] => {
  if (!descendants.length) {
    return [{ text: '' } as N];
  }
  return descendants;
};

const normalize = <N extends TDescendant>(
  descendants: N[],
  isInline: (node: N) => boolean,
  makeDefaultBlock: () => N
): N[] => {
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
        children: normalize(node.children as N[], isInline, makeDefaultBlock),
      };
    }
    return node;
  });

  return descendants;
};

/**
 * Normalize the descendants to a valid document fragment.
 */
export const normalizeDescendantsToDocumentFragment = <V extends Value>(
  editor: PlateEditor<V>,
  { descendants }: { descendants: EDescendant<V>[] }
): EDescendant<V>[] => {
  const isInline = isInlineNode<V>(editor);
  const defaultType = getPluginType(editor, ELEMENT_DEFAULT);
  const makeDefaultBlock = makeBlockLazy(defaultType);

  return normalize(descendants, isInline, makeDefaultBlock as any);
};
