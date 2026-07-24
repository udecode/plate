import type {
  DescendantIn,
  Editor,
  ContentSlice,
  ElementOrTextIn,
  Location,
  Value,
} from '../interfaces';
import { ElementApi, NodeApi, RangeApi, TextApi } from '../interfaces';
import type { NodeInsertNodesOptions } from '../interfaces/transforms/node';
import { ContentSlice as ContentSliceValue } from './content-slice';
import { getEditorMaxLength } from './public-state';

const getReplacementLength = (
  editor: Editor,
  options: { at?: Location } | undefined
) => {
  const target = options?.at ?? editor.read.selection();

  return RangeApi.isRange(target) ? editor.read.text.string(target).length : 0;
};

const getRemainingLength = (
  editor: Editor,
  options: { at?: Location } | undefined
) => {
  const maxLength = getEditorMaxLength(editor);

  if (maxLength === undefined) return;

  return Math.max(
    0,
    maxLength -
      (editor.read.text.string([]).length -
        getReplacementLength(editor, options))
  );
};

export const limitTextInsert = (
  editor: Editor,
  text: string,
  options: { at?: Location } | undefined
) => {
  const remaining = getRemainingLength(editor, options);

  return remaining === undefined || text.length <= remaining
    ? text
    : text.slice(0, remaining);
};

type RemainingTextLength = { value: number };

const limitNode = <TNode extends ElementOrTextIn<Value>>(
  node: TNode,
  remaining: RemainingTextLength
): TNode | null => {
  if (TextApi.isText(node)) {
    if (remaining.value <= 0 && node.text.length > 0) return null;

    const text = node.text.slice(0, remaining.value);
    remaining.value -= text.length;

    return { ...node, text } as TNode;
  }

  if (!ElementApi.isElement(node)) return null;

  const textLength = NodeApi.string(node).length;

  if (textLength === 0) return node;
  if (remaining.value <= 0) return null;

  const children = node.children
    .map((child) => limitNode(child, remaining))
    .filter((child): child is ElementOrTextIn<Value> => child !== null);

  return { ...node, children } as TNode;
};

export const limitFragmentInsert = <V extends Value>(
  editor: Editor<V>,
  fragment: readonly DescendantIn<V>[],
  options: { at?: Location } | undefined
) => {
  const remainingLength = getRemainingLength(editor, options);

  if (remainingLength === undefined) return fragment;

  const fragmentLength = fragment.reduce(
    (length, node) => length + NodeApi.string(node).length,
    0
  );

  if (fragmentLength <= remainingLength) return fragment;

  const remaining = { value: remainingLength };

  return fragment
    .map((node) => limitNode(node, remaining))
    .filter((node): node is DescendantIn<V> => node !== null);
};

const getOpenEdgeDepth = (
  content: readonly ElementOrTextIn<Value>[],
  edge: 'end' | 'start'
) => {
  let children = content;
  let depth = 0;

  for (;;) {
    const node = edge === 'start' ? children[0] : children.at(-1);

    if (!ElementApi.isElement(node)) return depth;

    depth += 1;
    children = node.children;
  }
};

/** Apply the editor's insertion limit while preserving valid open slice edges. */
export const limitSliceInsert = <V extends Value>(
  editor: Editor<V>,
  slice: ContentSlice<V>,
  options: { at?: Location } | undefined
): ContentSlice<V> => {
  const content = slice.content as readonly DescendantIn<V>[];
  const limited = limitFragmentInsert(editor, content, options);

  if (limited === content) return slice;

  return ContentSliceValue.fromJSON<V>({
    content: limited,
    openEnd: Math.min(slice.openEnd, getOpenEdgeDepth(limited, 'end')),
    openStart: Math.min(slice.openStart, getOpenEdgeDepth(limited, 'start')),
  });
};

export const limitNodeInsert = <
  V extends Value,
  TNode extends ElementOrTextIn<V>,
>(
  editor: Editor<V>,
  nodes: TNode | readonly TNode[],
  options: NodeInsertNodesOptions<TNode> | undefined
) => {
  const isList = Array.isArray(nodes);
  const input = (isList ? nodes : [nodes]) as readonly DescendantIn<V>[];
  const limited = limitFragmentInsert(
    editor,
    input,
    options
  ) as readonly TNode[];

  return isList ? limited : limited[0];
};
