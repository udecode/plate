import {
  addMark,
  bookmark,
  deleteBackward,
  deleteForward,
  deleteFragment,
  insertBreak,
  insertNode,
  insertSoftBreak,
  insertText,
  normalize,
  removeMark,
  setNormalizing,
  toggleMark,
} from '../editor';
import type {
  DescendantIn,
  Editor,
  EditorPublicTransformMiddlewareKey,
  EditorTransformMiddlewareArgs,
  EditorTransformRegistry,
  ElementOrTextIn,
  Location,
  Value,
} from '../interfaces';
import type { NodeInsertNodesOptions } from '../interfaces/transforms/node';
import { ElementApi, NodeApi, RangeApi, TextApi } from '../interfaces';
import {
  insertNodes,
  liftNodes,
  mergeNodes,
  moveNodes,
  removeNodes,
  replaceChildren,
  setNodes,
  splitNodes,
  unsetNodes,
  unwrapNodes,
  wrapNodes,
} from '../transforms-node';
import {
  collapse,
  deselect,
  move,
  select,
  setPoint,
  setSelection,
} from '../transforms-selection';
import { deleteText } from '../transforms-text';
import { insertFragment } from '../transforms-text/insert-fragment';
import type { TextUnit } from '../types';
import { getEditorMaxLength } from './public-state';
import { executeTransformMiddleware } from './transform-middleware';

export type EditorMethod = (editor: Editor, ...args: any[]) => unknown;

type BoundEditorMethod<T extends EditorMethod> = T extends (
  editor: Editor,
  ...args: infer Args
) => infer Result
  ? (...args: Args) => Result
  : never;

const isTextUnit = (unit: unknown): unit is TextUnit =>
  unit === 'character' ||
  unit === 'word' ||
  unit === 'line' ||
  unit === 'block';

const toTextUnit = (unit: unknown): TextUnit => {
  if (isTextUnit(unit)) return unit;

  const optionUnit =
    unit && typeof unit === 'object' && 'unit' in unit
      ? (unit as { unit?: unknown }).unit
      : undefined;

  if (isTextUnit(optionUnit)) return optionUnit;

  return 'character';
};

const getInsertReplacementLength = (
  editor: Editor,
  options: { at?: Location } | undefined
) => {
  const target = options?.at ?? editor.read.selection();

  return RangeApi.isRange(target) ? editor.read.text.string(target).length : 0;
};

const getRemainingInsertLength = (
  editor: Editor,
  options: { at?: Location } | undefined
) => {
  const maxLength = getEditorMaxLength(editor);

  if (maxLength === undefined) {
    return;
  }

  const currentLength = editor.read.text.string([]).length;
  const replacementLength = getInsertReplacementLength(editor, options);

  return Math.max(0, maxLength - (currentLength - replacementLength));
};

const truncateTextInsert = (
  editor: Editor,
  text: string,
  options: { at?: Location } | undefined
) => {
  const remainingLength = getRemainingInsertLength(editor, options);

  if (remainingLength === undefined || text.length <= remainingLength) {
    return text;
  }

  return text.slice(0, remainingLength);
};

type RemainingTextLength = {
  value: number;
};

const truncateNodeInsert = <TNode extends ElementOrTextIn<Value>>(
  node: TNode,
  remaining: RemainingTextLength
): TNode | null => {
  if (TextApi.isText(node)) {
    if (remaining.value <= 0 && node.text.length > 0) {
      return null;
    }

    const text = node.text.slice(0, remaining.value);
    remaining.value -= text.length;

    return { ...node, text } as TNode;
  }

  if (!ElementApi.isElement(node)) {
    return null;
  }

  const textLength = NodeApi.string(node).length;

  if (textLength === 0) {
    return node;
  }
  if (remaining.value <= 0) {
    return null;
  }

  const children = node.children
    .map((child) => truncateNodeInsert(child, remaining))
    .filter((child): child is ElementOrTextIn<Value> => child !== null);

  return { ...node, children } as TNode;
};

const truncateFragmentInsert = <V extends Value>(
  editor: Editor<V>,
  fragment: DescendantIn<V>[],
  options: { at?: Location } | undefined
) => {
  const remainingLength = getRemainingInsertLength(editor, options);

  if (remainingLength === undefined) {
    return fragment;
  }

  const fragmentLength = fragment.reduce(
    (length, node) => length + NodeApi.string(node).length,
    0
  );

  if (fragmentLength <= remainingLength) {
    return fragment;
  }

  const remaining = { value: remainingLength };

  return fragment
    .map((node) => truncateNodeInsert(node, remaining))
    .filter((node): node is DescendantIn<V> => node !== null);
};

const truncateNodeListInsert = <
  V extends Value,
  TNode extends ElementOrTextIn<V>,
>(
  editor: Editor<V>,
  nodes: TNode | TNode[],
  options: NodeInsertNodesOptions<TNode> | undefined
) => {
  const input = Array.isArray(nodes) ? nodes : [nodes];
  const truncated = truncateFragmentInsert(
    editor,
    input as DescendantIn<V>[],
    options
  ) as TNode[];

  return Array.isArray(nodes) ? truncated : truncated[0];
};

export const bindEditorMethod = <T extends EditorMethod>(
  getEditor: () => Editor,
  method: T
): BoundEditorMethod<T> =>
  ((...args: Parameters<BoundEditorMethod<T>>) =>
    method(getEditor(), ...args)) as BoundEditorMethod<T>;

export const createEditorTransformRegistry = <V extends Value>(
  getEditor: () => Editor<V>
): EditorTransformRegistry<V> => {
  const getRuntimeEditor = () => getEditor() as Editor;
  const bind = <T extends EditorMethod>(method: T) =>
    bindEditorMethod(getEditor, method);
  const runMiddleware = <TKey extends EditorPublicTransformMiddlewareKey>(
    key: TKey,
    args: EditorTransformMiddlewareArgs<V>[TKey],
    applyDefault: (args: EditorTransformMiddlewareArgs<V>[TKey]) => void
  ) => executeTransformMiddleware(getEditor(), key, args, applyDefault);

  return Object.freeze({
    addMark: (key, value) =>
      runMiddleware('addMark', { key, value }, (args) =>
        addMark(getEditor(), args.key, args.value)
      ),
    bookmark: bind(bookmark),
    collapse: (options) =>
      runMiddleware('collapse', { options }, (args) =>
        collapse(getEditor(), args.options)
      ),
    delete: (options) =>
      runMiddleware('delete', { options }, (args) =>
        deleteText(getRuntimeEditor(), args.options)
      ),
    deleteBackward: (unit) =>
      runMiddleware('deleteBackward', { unit: toTextUnit(unit) }, (args) =>
        deleteBackward(getEditor(), args.unit)
      ),
    deleteForward: (unit) =>
      runMiddleware('deleteForward', { unit: toTextUnit(unit) }, (args) =>
        deleteForward(getEditor(), args.unit)
      ),
    deleteFragment: (options) =>
      runMiddleware('deleteFragment', { options }, (args) =>
        deleteFragment(getEditor(), args.options)
      ),
    deselect: () => runMiddleware('deselect', {}, () => deselect(getEditor())),
    insertBreak: () =>
      runMiddleware('insertBreak', {}, () => insertBreak(getEditor())),
    insertFragment: (fragment, options) =>
      runMiddleware('insertFragment', { fragment, options }, (args) => {
        const truncated = truncateFragmentInsert(
          getRuntimeEditor(),
          args.fragment,
          args.options
        );

        if (truncated.length === 0 && args.fragment.length > 0) return;

        insertFragment(getRuntimeEditor(), truncated, args.options);
      }),
    insertNode: (node, options) =>
      runMiddleware('insertNode', { node, options }, (args) => {
        const truncated = truncateNodeListInsert(
          getRuntimeEditor(),
          args.node,
          args.options
        );

        if (!truncated) return;

        insertNode(getRuntimeEditor(), truncated, args.options);
      }),
    insertNodes: (nodes, options) =>
      runMiddleware('insertNodes', { nodes, options }, (args) => {
        const truncated = truncateNodeListInsert(
          getRuntimeEditor(),
          args.nodes,
          args.options
        );

        if (Array.isArray(truncated) && truncated.length === 0) return;
        if (!truncated) return;

        insertNodes(getRuntimeEditor(), truncated, args.options);
      }),
    insertSoftBreak: () =>
      runMiddleware('insertSoftBreak', {}, () => insertSoftBreak(getEditor())),
    insertText: (text, options) =>
      runMiddleware('insertText', { options, text }, (args) => {
        const truncated = truncateTextInsert(
          getEditor(),
          args.text,
          args.options
        );

        if (truncated.length === 0 && args.text.length > 0) return;

        insertText(getEditor(), truncated, args.options);
      }),
    liftNodes: (options) =>
      runMiddleware('liftNodes', { options }, (args) =>
        liftNodes(getRuntimeEditor(), args.options)
      ),
    mergeNodes: (options) =>
      runMiddleware('mergeNodes', { options }, (args) =>
        mergeNodes(getRuntimeEditor(), args.options)
      ),
    move: (options) =>
      runMiddleware('move', { options }, (args) =>
        move(getEditor(), args.options)
      ),
    moveNodes: (options) =>
      runMiddleware('moveNodes', { options }, (args) =>
        moveNodes(getRuntimeEditor(), args.options)
      ),
    normalize: bind(normalize),
    removeMark: (key) =>
      runMiddleware('removeMark', { key }, (args) =>
        removeMark(getEditor(), args.key)
      ),
    removeNodes: (options) =>
      runMiddleware('removeNodes', { options }, (args) =>
        removeNodes(getRuntimeEditor(), args.options)
      ),
    replaceChildren: (children, options) =>
      runMiddleware('replaceChildren', { children, options }, (args) =>
        replaceChildren(getRuntimeEditor(), args.children, args.options)
      ),
    select: (target) =>
      runMiddleware('select', { target }, (args) =>
        select(getEditor(), args.target)
      ),
    setNodes: (props, options) =>
      runMiddleware(
        'setNodes',
        {
          options:
            options as EditorTransformMiddlewareArgs<V>['setNodes']['options'],
          props: props as EditorTransformMiddlewareArgs<V>['setNodes']['props'],
        },
        (args) =>
          setNodes(
            getRuntimeEditor(),
            args.props as EditorTransformMiddlewareArgs['setNodes']['props'],
            args.options as EditorTransformMiddlewareArgs['setNodes']['options']
          )
      ),
    setNormalizing: bind(setNormalizing),
    setPoint: (props, options) =>
      runMiddleware('setPoint', { options, props }, (args) =>
        setPoint(getEditor(), args.props, args.options)
      ),
    setSelection: (props) =>
      runMiddleware('setSelection', { props }, (args) =>
        setSelection(getEditor(), args.props)
      ),
    splitNodes: (options) =>
      runMiddleware('splitNodes', { options }, (args) =>
        splitNodes(getRuntimeEditor(), args.options)
      ),
    toggleMark: (key, value, options) =>
      runMiddleware('toggleMark', { key, options, value }, (args) =>
        toggleMark(getEditor(), args.key, args.value, args.options)
      ),
    unsetNodes: (props, options) =>
      runMiddleware('unsetNodes', { options, props }, (args) =>
        unsetNodes(getRuntimeEditor(), args.props, args.options)
      ),
    unwrapNodes: (options) =>
      runMiddleware('unwrapNodes', { options }, (args) =>
        unwrapNodes(getRuntimeEditor(), args.options)
      ),
    wrapNodes: (element, options) =>
      runMiddleware('wrapNodes', { element, options }, (args) =>
        wrapNodes(getRuntimeEditor(), args.element, args.options)
      ),
  } satisfies EditorTransformRegistry<V>);
};
