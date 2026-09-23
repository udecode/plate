import type {
  ContentSlice,
  DescendantIn,
  AnyEditor as Editor,
  EditorStateView,
  ElementOrTextIn,
  Location,
  NodeSelection,
  Value,
} from '../interfaces';
import {
  ElementApi,
  NodeApi,
  RangeApi,
  SelectionApi,
  TextApi,
} from '../interfaces';
import {
  ContentSlice as ContentSliceValue,
  prepareContentSliceVariant,
} from './content-slice';
import { getEditorMaxLength } from './public-state';

type InsertLimitSource<V extends Value = Value> =
  | Editor<V>
  | EditorStateView<V, any>;
type InsertLimitTarget = Location | NodeSelection;

const getText = <V extends Value>(
  source: InsertLimitSource<V>,
  at?: InsertLimitTarget
): string =>
  'read' in source ? source.read.text.string(at) : source.text.string(at);

const getSelection = <V extends Value>(source: InsertLimitSource<V>) =>
  'read' in source ? source.read.selection() : source.selection();

const getReplacementLength = <V extends Value>(
  editor: InsertLimitSource<V>,
  options: { at?: InsertLimitTarget } | undefined
) => {
  if (options?.at !== undefined) {
    return RangeApi.isRange(options.at) || SelectionApi.isNode(options.at)
      ? getText(editor, options.at).length
      : 0;
  }

  const selection = getSelection(editor);

  return selection ? getText(editor, selection).length : 0;
};

const getRemainingLength = <V extends Value>(
  editor: InsertLimitSource<V>,
  options: { at?: InsertLimitTarget } | undefined
) => {
  const maxLength = getEditorMaxLength(editor);

  if (maxLength === undefined) return undefined;

  return Math.max(
    0,
    maxLength -
      (getText(editor, []).length - getReplacementLength(editor, options))
  );
};

export const limitTextInsert = <V extends Value>(
  editor: InsertLimitSource<V>,
  text: string,
  options: { at?: InsertLimitTarget } | undefined
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

    return { ...node, text };
  }

  if (!ElementApi.isElement(node)) return null;

  const textLength = NodeApi.string(node).length;

  if (textLength === 0) return node;
  if (remaining.value <= 0) return null;

  const children = node.children
    .map((child) => limitNode(child, remaining))
    .filter((child): child is ElementOrTextIn<Value> => child !== null);

  return { ...node, children };
};

export const limitFragmentInsert = <V extends Value>(
  editor: InsertLimitSource<V>,
  fragment: ReadonlyArray<DescendantIn<V>>,
  options: { at?: InsertLimitTarget } | undefined
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
  content: ReadonlyArray<ElementOrTextIn<Value>>,
  edge: 'end' | 'start'
) => {
  let children = content;
  let depth = 0;

  for (;;) {
    const node = edge === 'start' ? children[0] : children.at(-1);

    if (!ElementApi.isElement(node)) return depth;

    depth += 1;
    ({ children } = node);
  }
};

/** Apply the editor's insertion limit while preserving valid open slice edges. */
export const limitSliceInsert = <V extends Value>(
  editor: InsertLimitSource<V>,
  slice: ContentSlice<V>,
  options: { at?: InsertLimitTarget } | undefined
): ContentSlice<V> => {
  const content = slice.content as ReadonlyArray<DescendantIn<V>>;
  const limited = limitFragmentInsert(editor, content, options);

  if (limited === content) return slice;

  return prepareContentSliceVariant(
    ContentSliceValue.withContent(slice, limited, { open: 'closed' }),
    Math.min(slice.openStart, getOpenEdgeDepth(limited, 'start')),
    Math.min(slice.openEnd, getOpenEdgeDepth(limited, 'end'))
  );
};

export const limitNodeInsert = <
  V extends Value,
  TNode extends ElementOrTextIn<V>,
>(
  editor: InsertLimitSource<V>,
  nodes: TNode | readonly TNode[],
  options: { at?: InsertLimitTarget } | undefined
) => {
  const isList = Array.isArray(nodes);
  const input = (isList ? nodes : [nodes]) as ReadonlyArray<DescendantIn<V>>;
  const limited = limitFragmentInsert(
    editor,
    input,
    options
  ) as readonly TNode[];

  return isList ? limited : limited[0];
};
