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
  withoutNormalizing,
} from '../editor';
import type {
  Editor,
  EditorPublicTransformMiddlewareKey,
  EditorTransformMiddlewareArgs,
  EditorTransformRegistry,
  Value,
} from '../interfaces';
import {
  insertNodes,
  liftNodes,
  mergeNodes,
  moveNodes,
  removeNodes,
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
  ) => {
    executeTransformMiddleware(getEditor(), key, args, applyDefault);
  };

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
      runMiddleware('insertFragment', { fragment, options }, (args) =>
        insertFragment(getRuntimeEditor(), args.fragment, args.options)
      ),
    insertNode: (node, options) =>
      runMiddleware('insertNode', { node, options }, (args) =>
        insertNode(getRuntimeEditor(), args.node, args.options)
      ),
    insertNodes: (nodes, options) =>
      runMiddleware('insertNodes', { nodes, options }, (args) =>
        insertNodes(getRuntimeEditor(), args.nodes, args.options)
      ),
    insertSoftBreak: () =>
      runMiddleware('insertSoftBreak', {}, () => insertSoftBreak(getEditor())),
    insertText: (text, options) =>
      runMiddleware('insertText', { options, text }, (args) =>
        insertText(getEditor(), args.text, args.options)
      ),
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
    toggleMark: (key, value) =>
      runMiddleware('toggleMark', { key, value }, (args) =>
        toggleMark(getEditor(), args.key, args.value)
      ),
    unsetNodes: (props, options) =>
      runMiddleware('unsetNodes', { options, props }, (args) =>
        unsetNodes(getRuntimeEditor(), args.props, args.options)
      ),
    unwrapNodes: (options) =>
      runMiddleware('unwrapNodes', { options }, (args) =>
        unwrapNodes(getRuntimeEditor(), args.options)
      ),
    withoutNormalizing: bind(withoutNormalizing),
    wrapNodes: (element, options) =>
      runMiddleware('wrapNodes', { element, options }, (args) =>
        wrapNodes(getRuntimeEditor(), args.element, args.options)
      ),
  } satisfies EditorTransformRegistry<V>);
};
