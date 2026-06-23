import {
  getEditorRuntime,
  type InternalEditorRuntime,
  setEditorRuntime,
} from './core/editor-runtime';
import { inheritExtensionRegistry } from './core/extension-registry';
import {
  getCurrentSelection,
  getCurrentSelectionRoot,
  getTargetRuntime,
  withEditorOperationRoot,
  withEditorOperationRootChildren,
  withEditorRootChildren,
  withEditorRootChildrenGenerator,
  withEditorTargetRuntime,
} from './core/public-state';
import {
  getEditorTransformRegistry,
  setEditorTransformRegistry,
} from './core/transform-registry';
import { createEditor } from './create-editor';
import type { Bookmark } from './interfaces/bookmark';
import type {
  Editor,
  EditorCommitContext,
  EditorRuntime,
  EditorRuntimeOptions,
  EditorSnapshot,
  EditorStateView,
  EditorStateViewApi,
  EditorTransformRegistry,
  EditorUpdateContext,
  EditorUpdateOptions,
  EditorUpdateTransaction,
  EditorView,
  EditorViewOptions,
  RootKey,
  Selection,
  Value,
} from './interfaces/editor';
import type { Location } from './interfaces/location';
import type { Point } from './interfaces/point';
import type { Range } from './interfaces/range';
import {
  getRangeRoot,
  stripImplicitRangeRoots,
  withImplicitRangeRoot,
} from './internal/root-location';

type ViewState = {
  focused: boolean;
  readOnly: boolean;
  root: RootKey;
};

const MAIN_ROOT_KEY = 'main';

const resolvePublicViewRoot = (root: RootKey | undefined): RootKey => {
  if (root === MAIN_ROOT_KEY) {
    throw new Error('[Plite] Omit root to target the primary document.');
  }

  return root ?? MAIN_ROOT_KEY;
};

const createViewApi = (state: ViewState): EditorStateViewApi =>
  Object.freeze({
    isFocused: () => state.focused,
    isReadOnly: () => state.readOnly,
    root: () => state.root,
  });

const withRootRead = <T>(
  editor: Editor,
  viewState: ViewState,
  fn: () => T
): T => withEditorRootChildren(editor, viewState.root, fn);

const withRootGenerator = <T>(
  editor: Editor,
  viewState: ViewState,
  create: () => Iterable<T>
): Generator<T, void, undefined> =>
  withEditorRootChildrenGenerator(editor, viewState.root, create);

const rootMethod = <TMethod extends (...args: any[]) => any>(
  editor: Editor,
  viewState: ViewState,
  method: TMethod
): TMethod =>
  ((...args: Parameters<TMethod>): ReturnType<TMethod> =>
    withRootRead(editor, viewState, () => method(...args))) as TMethod;

const rootGeneratorMethod = <TMethod extends (...args: any[]) => Iterable<any>>(
  editor: Editor,
  viewState: ViewState,
  method: TMethod
): TMethod =>
  ((...args: Parameters<TMethod>) =>
    withRootGenerator(editor, viewState, () =>
      method(...args)
    )) as unknown as TMethod;

const rootBookmarkMethod = <
  TMethod extends EditorStateView<any, any>['ranges']['bookmark'],
>(
  method: TMethod,
  viewState: ViewState
): TMethod =>
  ((range, options) => {
    const rootMeta = getRangeRoot(range, viewState.root);

    if (!rootMeta.root) {
      throw new Error('Cannot create a Plite bookmark across multiple roots.');
    }

    const bookmark = method(
      withImplicitRangeRoot(range, rootMeta.root),
      options
    );
    const stripRange = (value: Range | null) =>
      value ? stripImplicitRangeRoots(value, rootMeta) : null;

    return {
      affinity: bookmark.affinity,
      resolve: () => stripRange(bookmark.resolve()),
      unref: () => stripRange(bookmark.unref()),
    } satisfies Bookmark;
  }) as TMethod;

const runRootTransform = <T>(
  editor: Editor,
  viewState: ViewState,
  fn: () => T
): T =>
  withEditorOperationRoot(editor, viewState.root, () =>
    withEditorOperationRootChildren(editor, viewState.root, fn)
  );

const runRootSelectionTransform = <T>(
  editor: Editor,
  viewState: ViewState,
  fn: () => T
): T | undefined => {
  if (!hasViewSelection(editor, viewState)) {
    return;
  }

  return runRootTransform(editor, viewState, fn);
};

const runRootImplicitTransform = <T>(
  editor: Editor,
  viewState: ViewState,
  options: { at?: Location } | undefined,
  fn: () => T
): T | undefined =>
  options?.at === undefined
    ? runRootSelectionTransform(editor, viewState, fn)
    : runRootTransform(editor, viewState, fn);

const createRootTransformRegistry = <V extends Value>(
  editor: Editor,
  registry: EditorTransformRegistry<V>,
  viewState: ViewState
): EditorTransformRegistry<V> => {
  const rootRegistry = {
    ...registry,
    addMark: (key, value) =>
      runRootSelectionTransform(editor, viewState, () =>
        registry.addMark(key, value)
      ),
    bookmark: rootBookmarkMethod(registry.bookmark, viewState),
    collapse: (options) =>
      runRootSelectionTransform(editor, viewState, () =>
        registry.collapse(options)
      ),
    delete: (options) =>
      runRootImplicitTransform(editor, viewState, options, () =>
        registry.delete(options)
      ),
    deleteBackward: (unit) =>
      runRootSelectionTransform(editor, viewState, () =>
        registry.deleteBackward(unit)
      ),
    deleteForward: (unit) =>
      runRootSelectionTransform(editor, viewState, () =>
        registry.deleteForward(unit)
      ),
    deleteFragment: (options) =>
      runRootSelectionTransform(editor, viewState, () =>
        registry.deleteFragment(options)
      ),
    deselect: () =>
      runRootSelectionTransform(editor, viewState, registry.deselect),
    insertBreak: () =>
      runRootSelectionTransform(editor, viewState, registry.insertBreak),
    insertFragment: (fragment, options) =>
      runRootImplicitTransform(editor, viewState, options, () =>
        registry.insertFragment(fragment, options)
      ),
    insertNode: (node, options) =>
      runRootImplicitTransform(editor, viewState, options, () =>
        registry.insertNode(node, options)
      ),
    insertNodes: (nodes, options) =>
      runRootImplicitTransform(editor, viewState, options, () =>
        registry.insertNodes(nodes, options)
      ),
    insertSoftBreak: () =>
      runRootSelectionTransform(editor, viewState, registry.insertSoftBreak),
    insertText: (text, options) =>
      runRootImplicitTransform(editor, viewState, options, () =>
        registry.insertText(text, options)
      ),
    liftNodes: (options) =>
      runRootImplicitTransform(editor, viewState, options, () =>
        registry.liftNodes(options)
      ),
    mergeNodes: (options) =>
      runRootImplicitTransform(editor, viewState, options, () =>
        registry.mergeNodes(options)
      ),
    move: (options) =>
      runRootSelectionTransform(editor, viewState, () =>
        registry.move(options)
      ),
    moveNodes: (options) =>
      runRootImplicitTransform(editor, viewState, options, () =>
        registry.moveNodes(options)
      ),
    normalize: (options) =>
      runRootTransform(editor, viewState, () => registry.normalize(options)),
    removeMark: (key) =>
      runRootSelectionTransform(editor, viewState, () =>
        registry.removeMark(key)
      ),
    removeNodes: (options) =>
      runRootImplicitTransform(editor, viewState, options, () =>
        registry.removeNodes(options)
      ),
    select: (target) =>
      runRootTransform(editor, viewState, () => registry.select(target)),
    setNodes: (props, options) =>
      runRootImplicitTransform(editor, viewState, options, () =>
        registry.setNodes(props, options)
      ),
    setPoint: (props, options) =>
      runRootSelectionTransform(editor, viewState, () =>
        registry.setPoint(props, options)
      ),
    setSelection: (props) =>
      runRootSelectionTransform(editor, viewState, () =>
        registry.setSelection(props)
      ),
    splitNodes: (options) =>
      runRootImplicitTransform(editor, viewState, options, () =>
        registry.splitNodes(options)
      ),
    toggleMark: (key, value) =>
      runRootSelectionTransform(editor, viewState, () =>
        registry.toggleMark(key, value)
      ),
    unsetNodes: (props, options) =>
      runRootImplicitTransform(editor, viewState, options, () =>
        registry.unsetNodes(props, options)
      ),
    unwrapNodes: (options) =>
      runRootImplicitTransform(editor, viewState, options, () =>
        registry.unwrapNodes(options)
      ),
    withoutNormalizing: (fn) =>
      registry.withoutNormalizing(() =>
        runRootTransform(editor, viewState, fn)
      ),
    wrapNodes: (element, options) =>
      runRootImplicitTransform(editor, viewState, options, () =>
        registry.wrapNodes(element, options)
      ),
  } satisfies EditorTransformRegistry<V>;

  return Object.freeze(rootRegistry);
};

const withViewSelection = (
  selection: Selection,
  viewState: ViewState,
  selectionRoot: RootKey
): Selection => (selectionRoot === viewState.root ? selection : null);

const hasViewSelection = (editor: Editor, viewState: ViewState) =>
  !getCurrentSelection(editor) ||
  getCurrentSelectionRoot(editor) === viewState.root;

const runWithViewSelection = <T>(
  editor: Editor,
  viewState: ViewState,
  fn: () => T
): T | undefined => {
  if (!hasViewSelection(editor, viewState)) {
    return;
  }

  return fn();
};

const withViewSnapshot = <V extends Value>(
  snapshot: EditorSnapshot<V>,
  viewState: ViewState,
  selectionRoot: RootKey
): EditorSnapshot<V> => {
  if (selectionRoot === viewState.root) {
    return snapshot;
  }

  return Object.freeze({
    ...snapshot,
    marks: null,
    selection: null,
  }) as EditorSnapshot<V>;
};

const withPointRoot = <TPoint extends Point>(
  point: TPoint,
  viewState: ViewState
): TPoint =>
  viewState.root === MAIN_ROOT_KEY || point.root !== undefined
    ? point
    : ({ ...point, root: viewState.root } as TPoint);

const withRangeRoot = <TRange extends Range>(
  range: TRange,
  viewState: ViewState
): TRange => {
  if (viewState.root === MAIN_ROOT_KEY) {
    return range;
  }

  return {
    anchor: withPointRoot(range.anchor, viewState),
    focus: withPointRoot(range.focus, viewState),
  } as TRange;
};

const withRootChildren = <T extends EditorStateView<any, any>>(
  editor: Editor,
  state: T,
  viewState: ViewState
): T['nodes'] =>
  Object.freeze({
    ...state.nodes,
    above: rootMethod(editor, viewState, state.nodes.above),
    children: rootMethod(editor, viewState, state.nodes.children),
    elementReadOnly: rootMethod(editor, viewState, state.nodes.elementReadOnly),
    entries: rootGeneratorMethod(editor, viewState, state.nodes.entries),
    find: rootMethod(editor, viewState, state.nodes.find),
    first: rootMethod(editor, viewState, state.nodes.first),
    get: rootMethod(editor, viewState, state.nodes.get),
    hasPath: rootMethod(editor, viewState, state.nodes.hasPath),
    last: rootMethod(editor, viewState, state.nodes.last),
    leaf: rootMethod(editor, viewState, state.nodes.leaf),
    levels: rootGeneratorMethod(editor, viewState, state.nodes.levels),
    next: rootMethod(editor, viewState, state.nodes.next),
    parent: rootMethod(editor, viewState, state.nodes.parent),
    path: rootMethod(editor, viewState, state.nodes.path),
    previous: rootMethod(editor, viewState, state.nodes.previous),
    some: rootMethod(editor, viewState, state.nodes.some),
    toArray: rootMethod(editor, viewState, state.nodes.toArray),
    void: rootMethod(editor, viewState, state.nodes.void),
  }) as T['nodes'];

const withRootPoints = <T extends EditorStateView<any, any>>(
  editor: Editor,
  state: T,
  viewState: ViewState
): T['points'] =>
  Object.freeze({
    ...state.points,
    after: rootMethod(editor, viewState, state.points.after),
    before: rootMethod(editor, viewState, state.points.before),
    end: rootMethod(editor, viewState, state.points.end),
    get: rootMethod(editor, viewState, state.points.get),
    isEdge: rootMethod(editor, viewState, state.points.isEdge),
    isEnd: rootMethod(editor, viewState, state.points.isEnd),
    isStart: rootMethod(editor, viewState, state.points.isStart),
    positions: rootGeneratorMethod(editor, viewState, state.points.positions),
    start: rootMethod(editor, viewState, state.points.start),
  }) as T['points'];

const withRootRanges = <T extends EditorStateView<any, any>>(
  editor: Editor,
  state: T,
  viewState: ViewState
): T['ranges'] =>
  Object.freeze({
    ...state.ranges,
    bookmark: rootBookmarkMethod(state.ranges.bookmark, viewState),
    edges: rootMethod(editor, viewState, state.ranges.edges),
    get: rootMethod(editor, viewState, state.ranges.get),
    project: rootMethod(editor, viewState, state.ranges.project),
    unhang: rootMethod(editor, viewState, state.ranges.unhang),
  }) as T['ranges'];

const withRootMarks = <T extends EditorStateView<any, any>>(
  editor: Editor,
  state: T,
  viewState: ViewState
): T['marks'] =>
  Object.freeze({
    ...state.marks,
    get: () => {
      if (getCurrentSelectionRoot(editor) !== viewState.root) {
        return null;
      }

      const selection = getCurrentSelection(editor);

      if (!selection) {
        return null;
      }

      return withRootRead(editor, viewState, () => {
        if (
          !state.nodes.hasPath(selection.anchor.path) ||
          !state.nodes.hasPath(selection.focus.path)
        ) {
          return null;
        }

        return state.marks.get();
      });
    },
  }) as T['marks'];

const withRootRuntime = <T extends EditorStateView<any, any>>(
  editor: Editor,
  state: T,
  viewState: ViewState
): T['runtime'] =>
  Object.freeze({
    ...state.runtime,
    idAt: rootMethod(editor, viewState, state.runtime.idAt),
    pathOf: rootMethod(editor, viewState, state.runtime.pathOf),
    snapshot: () =>
      withViewSnapshot(
        withRootRead(editor, viewState, () => state.runtime.snapshot()),
        viewState,
        getCurrentSelectionRoot(editor)
      ),
  }) as T['runtime'];

const withViewState = <T extends EditorStateView<any, any>>(
  editor: Editor,
  state: T,
  viewState: ViewState
): T & { view: EditorStateViewApi } =>
  Object.freeze({
    ...state,
    fragment: Object.freeze({
      ...state.fragment,
      get: rootMethod(editor, viewState, state.fragment.get),
    }),
    marks: withRootMarks(editor, state, viewState),
    nodes: withRootChildren(editor, state, viewState),
    points: withRootPoints(editor, state, viewState),
    ranges: withRootRanges(editor, state, viewState),
    runtime: withRootRuntime(editor, state, viewState),
    selection: Object.freeze({
      ...state.selection,
      get: () =>
        withViewSelection(
          state.selection.get(),
          viewState,
          getCurrentSelectionRoot(editor)
        ),
    }),
    text: Object.freeze({
      ...state.text,
      string: rootMethod(editor, viewState, state.text.string),
    }),
    view: createViewApi(viewState),
  });

const withViewTransaction = <V extends Value>(
  editor: Editor,
  transaction: EditorUpdateTransaction<V>,
  viewState: ViewState
): EditorUpdateTransaction<V> => {
  const state = withViewState(editor, transaction, viewState);
  const hasExplicitTarget = (options: { at?: Location } | undefined) =>
    options?.at !== undefined;
  const runSelectionMutation = (fn: () => void) => {
    runWithViewSelection(editor, viewState, () =>
      runRootTransform(editor, viewState, fn)
    );
  };
  const runImplicitSelectionMutation = (
    options: { at?: Location } | undefined,
    fn: () => void
  ) => {
    if (hasExplicitTarget(options)) {
      runRootTransform(editor, viewState, fn);
      return;
    }

    runSelectionMutation(fn);
  };

  return Object.freeze({
    ...state,
    break: Object.freeze({
      ...transaction.break,
      insert: () => runSelectionMutation(transaction.break.insert),
      insertSoft: () => runSelectionMutation(transaction.break.insertSoft),
    }),
    fragment: Object.freeze({
      ...state.fragment,
      delete: (options = {}) =>
        runImplicitSelectionMutation(options, () =>
          transaction.fragment.delete(options)
        ),
      insert: (
        fragment: Parameters<typeof transaction.fragment.insert>[0],
        options?: Parameters<typeof transaction.fragment.insert>[1]
      ) =>
        runImplicitSelectionMutation(options, () =>
          transaction.fragment.insert(fragment, options)
        ),
    }),
    marks: Object.freeze({
      ...state.marks,
      add: (key: string, value: unknown) =>
        runSelectionMutation(() => transaction.marks.add(key, value)),
      remove: (key: string) =>
        runSelectionMutation(() => transaction.marks.remove(key)),
      toggle: (key: string, value?: unknown) =>
        runSelectionMutation(() => transaction.marks.toggle(key, value)),
    }),
    nodes: Object.freeze<EditorUpdateTransaction<V>['nodes']>({
      ...state.nodes,
      insert: (nodes, options) =>
        runImplicitSelectionMutation(options, () =>
          transaction.nodes.insert(nodes, options)
        ),
      lift: (options) =>
        runImplicitSelectionMutation(options, () =>
          transaction.nodes.lift(options)
        ),
      merge: (options) =>
        runImplicitSelectionMutation(options, () =>
          transaction.nodes.merge(options)
        ),
      move: (options) =>
        runImplicitSelectionMutation(options, () =>
          transaction.nodes.move(options)
        ),
      remove: (options) =>
        runImplicitSelectionMutation(options, () =>
          transaction.nodes.remove(options)
        ),
      set: (props, options) =>
        runImplicitSelectionMutation(options, () =>
          transaction.nodes.set(props, options)
        ),
      split: (options) =>
        runImplicitSelectionMutation(options, () =>
          transaction.nodes.split(options)
        ),
      unset: (props, options) =>
        runImplicitSelectionMutation(options, () =>
          transaction.nodes.unset(props, options)
        ),
      unwrap: (options) =>
        runImplicitSelectionMutation(options, () =>
          transaction.nodes.unwrap(options)
        ),
      wrap: (element, options) =>
        runImplicitSelectionMutation(options, () =>
          transaction.nodes.wrap(element, options)
        ),
    }),
    selection: Object.freeze({
      ...state.selection,
      clear: () => runSelectionMutation(transaction.selection.clear),
      collapse: (options = {}) =>
        runSelectionMutation(() => transaction.selection.collapse(options)),
      move: (options = {}) =>
        runSelectionMutation(() => transaction.selection.move(options)),
      set: (target: Parameters<typeof transaction.selection.set>[0]) => {
        if (target == null) {
          runSelectionMutation(() => transaction.selection.set(null));
          return;
        }

        transaction.selection.set(target);
      },
      setPoint: (
        props: Parameters<typeof transaction.selection.setPoint>[0],
        options?: Parameters<typeof transaction.selection.setPoint>[1]
      ) =>
        runSelectionMutation(() =>
          transaction.selection.setPoint(props, options)
        ),
      setRange: (props: Parameters<typeof transaction.selection.setRange>[0]) =>
        runSelectionMutation(() => transaction.selection.setRange(props)),
    }),
    text: Object.freeze({
      ...state.text,
      delete: (options = {}) =>
        runImplicitSelectionMutation(options, () =>
          transaction.text.delete(options)
        ),
      deleteBackward: (options = {}) =>
        runSelectionMutation(() => transaction.text.deleteBackward(options)),
      deleteForward: (options = {}) =>
        runSelectionMutation(() => transaction.text.deleteForward(options)),
      insert: (
        text: string,
        options: Parameters<typeof transaction.text.insert>[1] = {}
      ) =>
        runImplicitSelectionMutation(options, () =>
          transaction.text.insert(text, options)
        ),
    }),
  }) as EditorUpdateTransaction<V>;
};

const withViewUpdateContext = <V extends Value>(
  editor: Editor<V>,
  baseContext: EditorUpdateContext<Editor<V>>,
  viewState: ViewState,
  getViewEditor: () => Editor<V> | null
): EditorUpdateContext<Editor<V>> =>
  Object.freeze({
    afterCommit(handler) {
      baseContext.afterCommit((context) => {
        const selectionRoot = context.snapshot.selection
          ? (getRangeRoot(context.snapshot.selection).root ?? MAIN_ROOT_KEY)
          : viewState.root;
        const snapshot = withViewSnapshot(
          context.snapshot,
          viewState,
          selectionRoot
        );
        const viewContext = {
          commit: context.commit,
          editor: getViewEditor() ?? editor,
          snapshot,
        } as EditorCommitContext<Editor<V>>;

        handler(viewContext);
      });
    },
  });

const createViewRuntime = <V extends Value>(
  editor: Editor<V>,
  baseRuntime: InternalEditorRuntime<V>,
  viewState: ViewState,
  getViewEditor: () => Editor<V> | null
): InternalEditorRuntime<V> =>
  Object.freeze({
    ...baseRuntime,
    above: (...args) =>
      withRootRead(editor, viewState, () => baseRuntime.above(...args)),
    after: (...args) =>
      withRootRead(editor, viewState, () => baseRuntime.after(...args)),
    before: (...args) =>
      withRootRead(editor, viewState, () => baseRuntime.before(...args)),
    edges: (...args) =>
      withRootRead(editor, viewState, () => baseRuntime.edges(...args)),
    elementReadOnly: (...args) =>
      withRootRead(editor, viewState, () =>
        baseRuntime.elementReadOnly(...args)
      ),
    first: (...args) =>
      withRootRead(editor, viewState, () => baseRuntime.first(...args)),
    fragment: (...args) =>
      withRootRead(editor, viewState, () => baseRuntime.fragment(...args)),
    getChildren: () =>
      withRootRead(editor, viewState, () => baseRuntime.getChildren()),
    getFragment: () =>
      withRootRead(editor, viewState, () => baseRuntime.getFragment()),
    getPathByRuntimeId: (...args) =>
      withRootRead(editor, viewState, () =>
        baseRuntime.getPathByRuntimeId(...args)
      ),
    getRuntimeId: (...args) =>
      withRootRead(editor, viewState, () => baseRuntime.getRuntimeId(...args)),
    getSelection: () =>
      withViewSelection(
        baseRuntime.getSelection(),
        viewState,
        getCurrentSelectionRoot(editor)
      ),
    getSnapshot: () =>
      withViewSnapshot(
        withRootRead(editor, viewState, () => baseRuntime.getSnapshot()),
        viewState,
        getCurrentSelectionRoot(editor)
      ),
    hasPath: (...args) =>
      withRootRead(editor, viewState, () => baseRuntime.hasPath(...args)),
    isEdge: (...args) =>
      withRootRead(editor, viewState, () => baseRuntime.isEdge(...args)),
    isEnd: (...args) =>
      withRootRead(editor, viewState, () => baseRuntime.isEnd(...args)),
    isStart: (...args) =>
      withRootRead(editor, viewState, () => baseRuntime.isStart(...args)),
    last: (...args) =>
      withRootRead(editor, viewState, () => baseRuntime.last(...args)),
    leaf: (...args) =>
      withRootRead(editor, viewState, () => baseRuntime.leaf(...args)),
    levels: (...args) =>
      withRootGenerator(editor, viewState, () => baseRuntime.levels(...args)),
    next: (...args) =>
      withRootRead(editor, viewState, () => baseRuntime.next(...args)),
    parent: (...args) =>
      withRootRead(editor, viewState, () => baseRuntime.parent(...args)),
    path: (...args) =>
      withRootRead(editor, viewState, () => baseRuntime.path(...args)),
    pathRef: (path, options = {}) =>
      baseRuntime.pathRef(path, { ...options, root: viewState.root }),
    point: (...args) =>
      withRootRead(editor, viewState, () => baseRuntime.point(...args)),
    pointRef: (point, options = {}) =>
      baseRuntime.pointRef(withPointRoot(point, viewState), options),
    positions: (...args) =>
      withRootGenerator(editor, viewState, () =>
        baseRuntime.positions(...args)
      ),
    previous: (...args) =>
      withRootRead(editor, viewState, () => baseRuntime.previous(...args)),
    projectRange: (...args) =>
      withRootRead(editor, viewState, () => baseRuntime.projectRange(...args)),
    range: (...args) =>
      withRootRead(editor, viewState, () => baseRuntime.range(...args)),
    rangeRef: (range, options = {}) =>
      baseRuntime.rangeRef(withRangeRoot(range, viewState), options),
    read: (fn) =>
      baseRuntime.read((state) =>
        fn(withViewState(editor, state, viewState) as EditorStateView<V>)
      ),
    subscribe: (listener) =>
      baseRuntime.subscribe((_snapshot, change) => {
        listener(
          withViewSnapshot(
            withRootRead(editor, viewState, () => baseRuntime.getSnapshot()),
            viewState,
            getCurrentSelectionRoot(editor)
          ),
          change
        );
      }),
    subscribeCommit: (listener) => baseRuntime.subscribeCommit(listener),
    subscribeSource: (source, listener) =>
      baseRuntime.subscribeSource(source, (_snapshot, change) => {
        listener(
          withViewSnapshot(
            withRootRead(editor, viewState, () => baseRuntime.getSnapshot()),
            viewState,
            getCurrentSelectionRoot(editor)
          ),
          change
        );
      }),
    string: (...args) =>
      withRootRead(editor, viewState, () => baseRuntime.string(...args)),
    update: (fn, updateOptions) => {
      if (viewState.readOnly) {
        throw new Error('Cannot update a read-only editor view.');
      }

      const runUpdate = () =>
        withEditorOperationRoot(editor, viewState.root, () => {
          baseRuntime.update((transaction, context) => {
            fn(
              withViewTransaction(editor, transaction, viewState),
              withViewUpdateContext(editor, context, viewState, getViewEditor)
            );
          }, updateOptions);
        });
      const targetRuntime = getViewEditor()
        ? getTargetRuntime(getViewEditor()!)
        : null;

      if (targetRuntime) {
        withEditorTargetRuntime(editor, targetRuntime, runUpdate);
        return;
      }

      runUpdate();
    },
    void: (...args) =>
      withRootRead(editor, viewState, () => baseRuntime.void(...args)),
  });

/** Create a root editor runtime around a new Plite editor. */
export const createEditorRuntime = <
  V extends Value,
  TExtensions extends readonly unknown[] = readonly [],
>(
  options: EditorRuntimeOptions<V, TExtensions> = {}
): EditorRuntime<V, TExtensions> => {
  const editor = createEditor(options);

  return Object.freeze({
    api: editor.api,
    editor,
    extend: editor.extend,
    getApi: editor.getApi,
    read: editor.read,
    subscribe: editor.subscribe,
    subscribeCommit: editor.subscribeCommit,
    update: editor.update,
  });
};

/** Create a root-scoped editor view from an existing runtime. */
export const createEditorView = <
  V extends Value,
  TExtensions extends readonly unknown[] = readonly [],
>(
  runtime: EditorRuntime<V, TExtensions>,
  options: EditorViewOptions = {}
): EditorView<V, TExtensions> => {
  const viewState: ViewState = {
    focused: false,
    readOnly: options.readOnly ?? false,
    root: resolvePublicViewRoot(options.root),
  };
  const baseRuntime = getEditorRuntime(runtime.editor);
  let viewEditor: Editor<V> | null = null;
  const viewRuntime = createViewRuntime(
    runtime.editor,
    baseRuntime,
    viewState,
    () => viewEditor
  );

  const view = {
    api: runtime.editor.api,
    blur: () => {
      viewState.focused = false;
    },
    get children() {
      return runtime.editor.read((state) =>
        state.value.root(
          viewState.root === MAIN_ROOT_KEY ? undefined : viewState.root
        )
      );
    },
    extend: runtime.editor.extend,
    focus: () => {
      viewState.focused = true;
    },
    getApi: runtime.editor.getApi,
    read: <T>(fn: (state: EditorStateView<V, TExtensions>) => T) =>
      viewRuntime.read(fn as (state: EditorStateView<V>) => T),
    root: viewState.root,
    runtime,
    subscribe: viewRuntime.subscribe,
    subscribeCommit: viewRuntime.subscribeCommit,
    update: (
      fn: (
        transaction: EditorUpdateTransaction<V, TExtensions>,
        context: EditorUpdateContext<Editor<V, TExtensions>>
      ) => void,
      updateOptions?: EditorUpdateOptions
    ) => {
      if (viewState.readOnly) {
        throw new Error('Cannot update a read-only editor view.');
      }

      viewRuntime.update(
        fn as (
          transaction: EditorUpdateTransaction<V>,
          context: EditorUpdateContext<Editor<V>>
        ) => void,
        updateOptions
      );
    },
  };

  viewEditor = view as unknown as typeof runtime.editor;

  setEditorRuntime(viewEditor, viewRuntime);
  inheritExtensionRegistry(viewEditor, runtime.editor);
  setEditorTransformRegistry(
    viewEditor,
    createRootTransformRegistry(
      runtime.editor,
      getEditorTransformRegistry(runtime.editor),
      viewState
    )
  );

  return Object.freeze(view);
};
