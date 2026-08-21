import { createCommandDispatch } from './core/command-registry';
import { getEditorCommitSnapshot } from './core/commit';
import {
  createEditorViewExtensionApis,
  extendEditor,
} from './core/editor-extension';
import {
  createEditorReadApi,
  createEditorUpdateApi,
} from './core/editor-lifecycle-api';
import {
  getEditorRuntime,
  getEditorRuntimeOwner,
  type InternalEditorReadRuntime,
  type InternalEditorRuntime,
  setEditorRuntime,
} from './core/editor-runtime';
import {
  getExtensionRegistry,
  inheritExtensionRegistry,
} from './core/extension-registry';
import {
  MAIN_ROOT_KEY,
  toInternalRoot,
  toPublicRoot,
} from './core/public-root';
import {
  getCurrentSelection,
  getCurrentSelectionRoot,
  getTargetRuntime,
  doesSelectionContain,
  doesSelectionIntersect,
  isSelectionAtBlockEnd,
  isSelectionAtBlockStart,
  isSelectionAcrossBlocks,
  isSelectionWithinText,
  isSelectionWithinBlock,
  readEditor,
  withEditorUpdateRoot,
  withEditorUpdateRootChildren,
  withEditorRootChildren,
  withEditorRootChildrenGenerator,
  withEditorTargetRuntime,
  isPersistedDocumentEnvelope,
  replaceTransformedSnapshot,
  transformEditorSnapshotInput,
} from './core/public-state';
import type {
  AnyEditor as Editor,
  EditorAnchorApi,
  EditorCommitContext,
  EditorExtensionReference,
  EditorKeyApi,
  EditorParentOptions,
  EditorSelectionBlockOptions,
  EditorSelectionTargetOptions,
  EditorSnapshot,
  EditorStateSliceApi,
  EditorStateView,
  EditorStateViewProvider,
  EditorStateViewApi,
  EditorTransactionSpecBuilder,
  EditorUpdateContext,
  EditorUpdateTransaction,
  EditorView,
  EditorViewOptions,
  NodeTarget,
  NamedRootKey,
  RootKey,
  Selection,
  SnapshotInput,
  Value,
} from './interfaces/editor';
import type { ElementIn, ElementOrTextIn } from './interfaces/element';
import type { Location } from './interfaces/location';
import type { Ancestor, NodeEntry } from './interfaces/node';
import { RangeApi } from './interfaces/range';
import type { SchemaPropertyHandle } from './interfaces/schema';
import type { NodeUnsetNodesOptions } from './interfaces/transforms/node';
import { withImplicitRangeRoot } from './internal/root-location';

type ViewState = {
  composing: boolean;
  focused: boolean;
  readOnly: boolean;
  root: RootKey;
};

type LayeredEditorView<TEditor> = Omit<TEditor, 'blur' | 'focus' | 'root'> &
  Pick<EditorView, 'blur' | 'focus' | 'root'>;

type CreateEditorView = {
  <
    const TEditor extends EditorStateViewProvider<() => unknown>,
    const TRoot extends RootKey = RootKey,
  >(
    sourceEditor: TEditor,
    options?: EditorViewOptions<TRoot>
  ): LayeredEditorView<TEditor>;
  <
    V extends Value,
    TExtensions extends readonly unknown[] = readonly [],
    const TRoot extends RootKey = RootKey,
  >(
    sourceEditor: Editor<V, TExtensions>,
    options?: EditorViewOptions<TRoot>
  ): EditorView<V, TExtensions>;
};

type ViewStateTransformInput<V extends Value> = Pick<
  EditorStateView<V, any>,
  | 'fragment'
  | 'key'
  | 'marks'
  | 'nodes'
  | 'points'
  | 'ranges'
  | 'root'
  | 'runtime'
  | 'selection'
  | 'text'
  | 'view'
> & {
  children: () => readonly unknown[];
  slice: Pick<EditorStateSliceApi<V>, 'get'> &
    Partial<Pick<EditorStateSliceApi<V>, 'export' | 'fit' | 'fitContent'>>;
  transaction?: EditorStateView<V, any>['transaction'];
};

const createViewApi = (state: ViewState): EditorStateViewApi =>
  Object.freeze({
    isComposing: () => state.composing,
    isFocused: () => state.focused,
    isReadOnly: () => state.readOnly,
    root: () => toPublicRoot(state.root),
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

const runRootTransform = <T>(
  editor: Editor,
  viewState: ViewState,
  fn: () => T
): T =>
  withEditorUpdateRoot(editor, viewState.root, () =>
    withEditorUpdateRootChildren(editor, viewState.root, fn)
  );

const withViewSelection = (
  selection: Selection,
  viewState: ViewState,
  selectionRoot: RootKey
): Selection => {
  if (selectionRoot !== viewState.root || !selection) return null;
  if (viewState.root === MAIN_ROOT_KEY || !RangeApi.isRange(selection)) {
    return selection;
  }

  return {
    ...selection,
    ...withImplicitRangeRoot(selection, viewState.root),
  };
};

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
  const selection = withViewSelection(
    snapshot.selection,
    viewState,
    selectionRoot
  );

  if (selection === snapshot.selection) return snapshot;

  return Object.freeze({
    ...snapshot,
    selection,
  }) as EditorSnapshot<V>;
};

const withRootChildren = <
  V extends Value,
  T extends ViewStateTransformInput<V>,
>(
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

const withRootPoints = <V extends Value, T extends ViewStateTransformInput<V>>(
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
    isWordEnd: rootMethod(editor, viewState, state.points.isWordEnd),
    positions: rootGeneratorMethod(editor, viewState, state.points.positions),
    start: rootMethod(editor, viewState, state.points.start),
  }) as T['points'];

const withRootRanges = <V extends Value, T extends ViewStateTransformInput<V>>(
  editor: Editor,
  state: T,
  viewState: ViewState
): T['ranges'] =>
  Object.freeze({
    ...state.ranges,
    edges: rootMethod(editor, viewState, state.ranges.edges),
    fromEntries: rootMethod(editor, viewState, state.ranges.fromEntries),
    get: rootMethod(editor, viewState, state.ranges.get),
    project: rootMethod(editor, viewState, state.ranges.project),
    unhang: rootMethod(editor, viewState, state.ranges.unhang),
  }) as T['ranges'];

const withRootMarks = <V extends Value, T extends ViewStateTransformInput<V>>(
  editor: Editor,
  state: T,
  viewState: ViewState
): T['marks'] =>
  Object.freeze(
    Object.assign(() => {
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

        return state.marks();
      });
    }, state.marks)
  ) as T['marks'];

const withRootRuntime = <V extends Value, T extends ViewStateTransformInput<V>>(
  editor: Editor,
  state: T,
  viewState: ViewState
): T['runtime'] =>
  Object.freeze({
    ...state.runtime,
    snapshot: () =>
      withViewSnapshot(
        withRootRead(editor, viewState, () => state.runtime.snapshot()),
        viewState,
        getCurrentSelectionRoot(editor)
      ),
  }) as T['runtime'];

const withViewState = <V extends Value, T extends ViewStateTransformInput<V>>(
  editor: Editor,
  state: T,
  viewState: ViewState
): T & { view: EditorStateViewApi } => {
  // oxlint-disable-next-line prefer-const -- View methods close over the frozen state assigned after construction.
  let scopedState!: T & { view: EditorStateViewApi };
  const selection = () =>
    withViewSelection(
      state.selection(),
      viewState,
      getCurrentSelectionRoot(editor)
    );
  const baseSliceFit = state.slice.fit;
  const baseSliceFitContent = state.slice.fitContent;
  const baseSliceExport = state.slice.export;
  const fitSlice = baseSliceFit
    ? (((slice, options) => {
        const run = () =>
          runRootTransform(editor, viewState, () =>
            baseSliceFit(slice, options)
          );

        if (options?.at !== undefined) return run();

        return runWithViewSelection(editor, viewState, run) ?? false;
      }) satisfies EditorStateSliceApi<V>['fit'])
    : undefined;
  const fitSliceContent = baseSliceFitContent
    ? (((slice, options) =>
        runRootTransform(editor, viewState, () =>
          baseSliceFitContent(slice, options)
        )) satisfies EditorStateSliceApi<V>['fitContent'])
    : undefined;
  const transaction = state.transaction
    ? Object.assign(
        (fn: (transaction: EditorTransactionSpecBuilder<V, any>) => void) =>
          runRootTransform(editor, viewState, () =>
            state.transaction!((tx) =>
              fn(withViewSpecTransaction(editor, tx, viewState))
            )
          ),
        {
          extend: (
            base: Parameters<
              EditorStateView<V, any>['transaction']['extend']
            >[0],
            fn: (transaction: EditorTransactionSpecBuilder<V, any>) => void
          ) =>
            runRootTransform(editor, viewState, () =>
              state.transaction!.extend(base, (tx) =>
                fn(withViewSpecTransaction(editor, tx, viewState))
              )
            ),
        }
      )
    : undefined;
  const ranges = withRootRanges<V, T>(editor, state, viewState);
  const selectionRangeState = { ranges };

  scopedState = Object.freeze({
    ...state,
    children: () =>
      viewState.root === MAIN_ROOT_KEY
        ? state.children()
        : state.root(viewState.root),
    fragment: Object.freeze(
      Object.assign(
        rootMethod(editor, viewState, state.fragment),
        state.fragment
      )
    ),
    key: rootMethod(editor, viewState, state.key),
    marks: withRootMarks<V, T>(editor, state, viewState),
    nodes: withRootChildren<V, T>(editor, state, viewState),
    points: withRootPoints<V, T>(editor, state, viewState),
    ranges,
    runtime: withRootRuntime<V, T>(editor, state, viewState),
    slice: Object.freeze({
      ...(fitSlice ? { fit: fitSlice } : {}),
      ...(fitSliceContent ? { fitContent: fitSliceContent } : {}),
      ...(baseSliceExport
        ? { export: rootMethod(editor, viewState, baseSliceExport) }
        : {}),
      get: rootMethod(editor, viewState, state.slice.get),
    }) as T['slice'],
    selection: Object.freeze(
      Object.assign(selection, {
        contains: (target: NodeTarget) =>
          doesSelectionContain(selectionRangeState, selection(), target),
        primaryRange: () => state.selection.primaryRange(),
        intersects: (target: NodeTarget) =>
          doesSelectionIntersect(selectionRangeState, selection(), target),
        isAcrossBlocks: (options?: EditorSelectionBlockOptions) =>
          isSelectionAcrossBlocks(scopedState, selection(), options),
        isAtBlockEnd: (options?: EditorSelectionBlockOptions) =>
          isSelectionAtBlockEnd(scopedState, selection(), options),
        isAtBlockStart: (options?: EditorSelectionBlockOptions) =>
          isSelectionAtBlockStart(scopedState, selection(), options),
        isCollapsed: () => {
          const currentSelection = selection();

          return !!currentSelection && RangeApi.isCollapsed(currentSelection);
        },
        isExpanded: () => {
          const currentSelection = selection();

          return !!currentSelection && RangeApi.isExpanded(currentSelection);
        },
        isWithinBlock: (options?: EditorSelectionBlockOptions) =>
          isSelectionWithinBlock(scopedState, selection(), options),
        isWithinText: (options?: EditorSelectionTargetOptions) =>
          isSelectionWithinText(selectionRangeState, selection(), options),
        ranges: () => state.selection.ranges(),
        replacementRange: () => state.selection.replacementRange(),
        root: () => (selection() ? toPublicRoot(viewState.root) : undefined),
      })
    ),
    text: Object.freeze({
      ...state.text,
      string: rootMethod(editor, viewState, state.text.string),
    }),
    ...(transaction ? { transaction } : {}),
    view: createViewApi(viewState),
  });

  return scopedState;
};

function withViewSpecTransaction<V extends Value>(
  editor: Editor,
  transaction: EditorTransactionSpecBuilder<V, any>,
  viewState: ViewState
): EditorTransactionSpecBuilder<V, any> {
  return withViewTransaction(
    editor,
    transaction as EditorUpdateTransaction<V, any>,
    viewState
  ) as EditorTransactionSpecBuilder<V, any>;
}

const withViewTransaction = <V extends Value>(
  editor: Editor,
  transaction: EditorUpdateTransaction<V, any>,
  viewState: ViewState,
  getViewEditor?: () => Editor<V> | null
): EditorUpdateTransaction<V, any> => {
  const state = withViewState<V, EditorUpdateTransaction<V, any>>(
    editor,
    transaction,
    viewState
  );
  const hasExplicitTarget = (options: { at?: NodeTarget } | undefined) =>
    options?.at !== undefined;
  const runSelectionMutation = <T>(fn: () => T): T | undefined =>
    runWithViewSelection(editor, viewState, () =>
      runRootTransform(editor, viewState, fn)
    );
  const runImplicitSelectionMutation = <T>(
    options: { at?: NodeTarget } | undefined,
    fn: () => T
  ): T | undefined => {
    if (hasExplicitTarget(options)) {
      return runRootTransform(editor, viewState, fn);
    }

    return runSelectionMutation(fn);
  };
  const replaceValue = (input: SnapshotInput<V>) => {
    if (isPersistedDocumentEnvelope(input)) {
      throw new Error(
        'A persisted document envelope can replace only the complete editor, not one editor view root.'
      );
    }

    return runRootTransform(editor, viewState, () => {
      const value = transaction.value();
      const selection =
        input.selection &&
        input.selection !== 'start' &&
        input.selection !== 'end' &&
        viewState.root !== MAIN_ROOT_KEY
          ? {
              ...input.selection,
              anchor: { ...input.selection.anchor, root: viewState.root },
              focus: { ...input.selection.focus, root: viewState.root },
            }
          : input.selection;

      const scopedInput: SnapshotInput<V> = {
        ...(viewState.root === MAIN_ROOT_KEY
          ? { ...value, children: input.children }
          : {
              ...value,
              roots: {
                ...value.roots,
                [viewState.root]: input.children,
              },
            }),
        selection:
          input.selection === 'start' || input.selection === 'end'
            ? null
            : selection,
      };
      const transformedInput = transformEditorSnapshotInput(
        editor,
        scopedInput
      );

      if (isPersistedDocumentEnvelope(transformedInput)) {
        throw new Error(
          'A persisted document envelope can replace only the complete editor, not one editor view root.'
        );
      }

      replaceTransformedSnapshot(editor, transformedInput);

      if (input.selection === 'start' || input.selection === 'end') {
        const point =
          input.selection === 'start'
            ? transaction.points.start([])
            : transaction.points.end([]);

        if (point) transaction.selection.set(point);
      }
    });
  };

  const viewTransaction = Object.freeze({
    ...state,
    ...(getViewEditor
      ? {
          command: ((definition, input) => {
            const viewEditor = getViewEditor();

            if (!viewEditor) {
              throw new Error('Editor view is not initialized.');
            }

            return Reflect.apply(
              getEditorRuntime(viewEditor).runCommand,
              getEditorRuntime(viewEditor),
              [definition, input]
            );
          }) as EditorUpdateTransaction<V, any>['command'],
        }
      : {}),
    anchor: (value, anchorOptions) =>
      runRootTransform(editor, viewState, () =>
        transaction.anchor(value, anchorOptions)
      ),
    blocks: Object.freeze<EditorUpdateTransaction<V, any>['blocks']>({
      duplicate: ((options?: { at?: NodeTarget }) =>
        runImplicitSelectionMutation(options, () =>
          transaction.blocks.duplicate(options as never)
        )) as EditorUpdateTransaction<V, any>['blocks']['duplicate'],
      insertAfter: (
        nodes: ElementIn<V> | readonly ElementIn<V>[],
        options?: { at?: NodeTarget }
      ) =>
        runImplicitSelectionMutation(options, () =>
          transaction.blocks.insertAfter(nodes, options as never)
        ),
      lift: ((options?: { at?: NodeTarget }) =>
        runImplicitSelectionMutation(options, () =>
          transaction.blocks.lift(options as never)
        )) as EditorUpdateTransaction<V, any>['blocks']['lift'],
      reset: (props, options) =>
        runImplicitSelectionMutation(options, () =>
          transaction.blocks.reset(props, options)
        ),
      toggle: (type, options) =>
        runImplicitSelectionMutation(options, () =>
          transaction.blocks.toggle(type, options)
        ),
    }),
    break: Object.freeze({
      ...transaction.break,
      insert: () => runSelectionMutation(transaction.break.insert),
      insertSoft: () => runSelectionMutation(transaction.break.insertSoft),
    }),
    fragment: Object.freeze(
      Object.assign(
        (...args: Parameters<typeof state.fragment>) => state.fragment(...args),
        {
          delete: (options = {}) =>
            runImplicitSelectionMutation(options, () =>
              transaction.fragment.delete(options)
            ),
          replace: (
            content: Parameters<typeof transaction.fragment.replace>[0],
            options?: Parameters<typeof transaction.fragment.replace>[1]
          ) =>
            runImplicitSelectionMutation(options, () =>
              transaction.fragment.replace(content, options)
            ) ?? false,
        }
      )
    ),
    marks: Object.freeze(
      Object.assign(() => state.marks(), {
        add: (key: string, value: unknown) =>
          runSelectionMutation(() => transaction.marks.add(key, value)),
        remove: (key: string) =>
          runSelectionMutation(() => transaction.marks.remove(key)),
        set: (marks: Parameters<typeof transaction.marks.set>[0]) =>
          runSelectionMutation(() => transaction.marks.set(marks)),
        toggle: (key: string, value?: unknown) =>
          runSelectionMutation(() => transaction.marks.toggle(key, value)),
      }) satisfies typeof transaction.marks
    ),
    nodes: Object.freeze<EditorUpdateTransaction<V, any>['nodes']>({
      ...state.nodes,
      duplicate: (entries, options) =>
        runRootTransform(editor, viewState, () =>
          transaction.nodes.duplicate(entries, options)
        ),
      insert: ((
        nodes: ElementOrTextIn<V> | readonly ElementOrTextIn<V>[],
        options?: { at?: NodeTarget }
      ) =>
        runImplicitSelectionMutation(options, () =>
          transaction.nodes.insert(nodes, options as never)
        )) as EditorUpdateTransaction<V, any>['nodes']['insert'],
      lift: ((options?: { at?: NodeTarget }) =>
        runImplicitSelectionMutation(options, () =>
          transaction.nodes.lift(options as never)
        )) as EditorUpdateTransaction<V, any>['nodes']['lift'],
      merge: ((options?: { at?: NodeTarget }) =>
        runImplicitSelectionMutation(options, () =>
          transaction.nodes.merge(options as never)
        )) as EditorUpdateTransaction<V, any>['nodes']['merge'],
      move: ((options: { at?: NodeTarget }) =>
        runImplicitSelectionMutation(options, () =>
          transaction.nodes.move(options as never)
        )) as EditorUpdateTransaction<V, any>['nodes']['move'],
      remove: ((options?: { at?: NodeTarget }) =>
        runImplicitSelectionMutation(options, () =>
          transaction.nodes.remove(options as never)
        )) as EditorUpdateTransaction<V, any>['nodes']['remove'],
      replace: (nodes, options) =>
        runImplicitSelectionMutation({ at: options.at }, () =>
          transaction.nodes.replace(nodes, options)
        ),
      replaceChildren: (children, options) =>
        runImplicitSelectionMutation({ at: options.at }, () =>
          transaction.nodes.replaceChildren(children, options)
        ),
      set: ((...args: Parameters<typeof transaction.nodes.set>) =>
        runImplicitSelectionMutation(args[1], () =>
          transaction.nodes.set(...args)
        )) as typeof transaction.nodes.set,
      split: ((options?: { at?: NodeTarget }) =>
        runImplicitSelectionMutation(options, () =>
          transaction.nodes.split(options as never)
        )) as EditorUpdateTransaction<V, any>['nodes']['split'],
      unset: ((
        props: string | readonly string[] | SchemaPropertyHandle,
        options?: NodeUnsetNodesOptions
      ) =>
        runImplicitSelectionMutation(options, () =>
          (
            transaction.nodes.unset as (
              property: string | readonly string[] | SchemaPropertyHandle,
              options?: NodeUnsetNodesOptions
            ) => void
          )(props, options)
        )) as typeof transaction.nodes.unset,
      unwrap: ((options?: { at?: NodeTarget }) =>
        runImplicitSelectionMutation(options, () =>
          transaction.nodes.unwrap(options as never)
        )) as EditorUpdateTransaction<V, any>['nodes']['unwrap'],
      wrap: ((element: ElementIn<V>, options?: { at?: NodeTarget }) =>
        runImplicitSelectionMutation(options, () =>
          transaction.nodes.wrap(element, options as never)
        )) as EditorUpdateTransaction<V, any>['nodes']['wrap'],
    }),
    selection: Object.freeze(
      Object.assign(() => state.selection(), {
        contains: (target: NodeTarget) => state.selection.contains(target),
        primaryRange: () => state.selection.primaryRange(),
        intersects: (target: NodeTarget) => state.selection.intersects(target),
        isAcrossBlocks: (options?: EditorSelectionBlockOptions) =>
          state.selection.isAcrossBlocks(options),
        isAtBlockEnd: (options?: EditorSelectionBlockOptions) =>
          state.selection.isAtBlockEnd(options),
        isAtBlockStart: (options?: EditorSelectionBlockOptions) =>
          state.selection.isAtBlockStart(options),
        isCollapsed: () => state.selection.isCollapsed(),
        isExpanded: () => state.selection.isExpanded(),
        isWithinBlock: (options?: EditorSelectionBlockOptions) =>
          state.selection.isWithinBlock(options),
        isWithinText: (options?: EditorSelectionTargetOptions) =>
          state.selection.isWithinText(options),
        ranges: () => state.selection.ranges(),
        replacementRange: () => state.selection.replacementRange(),
        root: () => state.selection.root(),
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

          runRootTransform(editor, viewState, () =>
            transaction.selection.set(target)
          );
        },
        setPoint: (
          props: Parameters<typeof transaction.selection.setPoint>[0],
          options?: Parameters<typeof transaction.selection.setPoint>[1]
        ) =>
          runSelectionMutation(() =>
            transaction.selection.setPoint(props, options)
          ),
        setRange: (
          props: Parameters<typeof transaction.selection.setRange>[0]
        ) => runSelectionMutation(() => transaction.selection.setRange(props)),
      }) satisfies typeof transaction.selection
    ),
    slice: Object.freeze({
      get: (options?: Parameters<typeof transaction.slice.get>[0]) =>
        state.slice.get(options),
      replace: (
        slice: Parameters<typeof transaction.slice.replace>[0],
        options?: Parameters<typeof transaction.slice.replace>[1]
      ) =>
        runImplicitSelectionMutation(options, () =>
          transaction.slice.replace(slice, options)
        ) ?? false,
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
    value: Object.freeze(
      Object.assign(() => state.value(), {
        replace: replaceValue,
      })
    ),
  }) as EditorUpdateTransaction<V, any>;

  return viewTransaction;
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
        const viewContext = {
          commit: context.commit,
          editor: getViewEditor() ?? editor,
          snapshot: withViewSnapshot(
            getEditorCommitSnapshot(context.commit, viewState.root),
            viewState,
            viewState.root
          ),
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
): InternalEditorRuntime<V> => {
  let cachedBaseState: EditorStateView<V, any> | undefined;
  let cachedViewState: EditorStateView<V, any> | undefined;
  const projectState = (state: EditorStateView<V, any>) => {
    if (state !== cachedBaseState) {
      cachedBaseState = state;
      cachedViewState = withViewState<V, EditorStateView<V, any>>(
        editor,
        state,
        viewState
      ) as EditorStateView<V, any>;
    }

    return cachedViewState!;
  };

  return Object.freeze({
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
    getPathByNodeKey: (...args) =>
      withRootRead(editor, viewState, () =>
        baseRuntime.getPathByNodeKey(...args)
      ),
    getNodeKey: (...args) =>
      withRootRead(editor, viewState, () => baseRuntime.getNodeKey(...args)),
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
    parent: ((at: Location, options?: EditorParentOptions) =>
      withRootRead(editor, viewState, () =>
        (
          baseRuntime.parent as (
            at: Location,
            options?: EditorParentOptions
          ) => NodeEntry<Ancestor> | undefined
        )(at, options)
      )) as InternalEditorReadRuntime['parent'],
    path: (...args) =>
      withRootRead(editor, viewState, () => baseRuntime.path(...args)),
    point: (...args) =>
      withRootRead(editor, viewState, () => baseRuntime.point(...args)),
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
    read: (fn) => baseRuntime.read((state) => fn(projectState(state))),
    runCommand: createCommandDispatch(() => {
      if (viewState.readOnly) {
        throw new Error('Cannot update a read-only editor view.');
      }

      const viewEditor = getViewEditor();

      if (!viewEditor) {
        throw new Error('Editor view is not initialized.');
      }

      return viewEditor;
    }),
    subscribe: (listener) =>
      baseRuntime.subscribe((_snapshot, change) => {
        listener(
          change
            ? withViewSnapshot(
                getEditorCommitSnapshot(change, viewState.root),
                viewState,
                viewState.root
              )
            : withViewSnapshot(
                withRootRead(editor, viewState, () =>
                  baseRuntime.getSnapshot()
                ),
                viewState,
                getCurrentSelectionRoot(editor)
              ),
          change
        );
      }),
    subscribeCommit: (listener) =>
      baseRuntime.subscribeCommit((change) => {
        listener(
          change,
          withViewSnapshot(
            getEditorCommitSnapshot(change, viewState.root),
            viewState,
            viewState.root
          )
        );
      }),
    subscribeSource: (source, listener) =>
      baseRuntime.subscribeSource(source, (_snapshot, change) => {
        listener(
          change
            ? withViewSnapshot(
                getEditorCommitSnapshot(change, viewState.root),
                viewState,
                viewState.root
              )
            : withViewSnapshot(
                withRootRead(editor, viewState, () =>
                  baseRuntime.getSnapshot()
                ),
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
        withEditorUpdateRoot(editor, viewState.root, () => {
          baseRuntime.update((transaction, context) => {
            fn(
              withViewTransaction(
                editor,
                transaction,
                viewState,
                getViewEditor
              ),
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
};

/** Create a root-scoped editor view from an existing editor. */
const createEditorViewRuntime = <
  V extends Value,
  TExtensions extends readonly unknown[] = readonly [],
  const TRoot extends RootKey = RootKey,
>(
  sourceEditor: Editor<V, TExtensions>,
  options: EditorViewOptions<TRoot> = {}
): EditorView<V, TExtensions> => {
  const viewState: ViewState = {
    composing: sourceEditor.read.view.isComposing(),
    focused: sourceEditor.read.view.isFocused(),
    readOnly: options.readOnly ?? false,
    root: toInternalRoot(options.root),
  };
  const baseRuntime = getEditorRuntime(sourceEditor);
  let viewEditor: Editor<V> | null = null;
  const viewRuntime = createViewRuntime(
    sourceEditor,
    baseRuntime,
    viewState,
    () => viewEditor
  );
  const viewRead = createEditorReadApi<V, TExtensions>((fn) =>
    viewRuntime.read((state) => fn(state as EditorStateView<V, TExtensions>))
  );
  const viewUpdate = createEditorUpdateApi<V, TExtensions>(
    (fn, policy) => {
      if (viewState.readOnly) {
        throw new Error('Cannot update a read-only editor view.');
      }

      viewRuntime.update(
        fn as (
          transaction: EditorUpdateTransaction<V, any>,
          context: EditorUpdateContext<Editor<V, any>>
        ) => void,
        { tags: policy.tags }
      );
    },
    {
      hasTxGroup: (groupName) =>
        getExtensionRegistry(sourceEditor).txGroups.has(groupName),
      repairValue: () => {
        if (viewState.readOnly) {
          throw new Error('Cannot update a read-only editor view.');
        }

        sourceEditor.update.value.repair();
      },
    }
  );
  const createViewAnchor: EditorAnchorApi = (value, anchorOptions) =>
    runRootTransform(sourceEditor, viewState, () =>
      sourceEditor.anchor(value, anchorOptions)
    );
  const createViewKey: EditorKeyApi = rootMethod(sourceEditor, viewState, ((
    target
  ) =>
    readEditor(sourceEditor, (state) =>
      state.key(target as never)
    )) as EditorKeyApi);
  const installView: EditorView<V, TExtensions>['install'] = (
    extension,
    options
  ) => extendEditor(viewEditor!, extension, options);
  let extensionApis: Pick<Editor<V, TExtensions>, 'api' | 'extension'> | null =
    null;

  const view = {
    get api() {
      return extensionApis?.api ?? sourceEditor.api;
    },
    anchor: createViewAnchor,
    blur: () => {
      viewState.focused = false;
    },
    get children() {
      return sourceEditor.read((state) =>
        viewState.root === MAIN_ROOT_KEY
          ? state.children()
          : state.root(viewState.root)
      );
    },
    install: installView,
    focus: () => {
      viewState.focused = true;
    },
    extension: ((descriptor: EditorExtensionReference) =>
      (
        (extensionApis?.extension ?? sourceEditor.extension) as unknown as (
          extension: EditorExtensionReference
        ) => Readonly<{ api: unknown }>
      )(descriptor)) as unknown as Editor<V, TExtensions>['extension'],
    id: sourceEditor.id,
    key: createViewKey,
    read: viewRead,
    root: toPublicRoot(viewState.root) as NamedRootKey | undefined,
    subscribe: viewRuntime.subscribe,
    subscribeCommit: viewRuntime.subscribeCommit,
    update: viewUpdate,
  };

  viewEditor = view as unknown as typeof sourceEditor;

  setEditorRuntime(
    viewEditor,
    viewRuntime,
    getEditorRuntimeOwner(sourceEditor),
    viewState.root
  );
  inheritExtensionRegistry(viewEditor, sourceEditor);
  extensionApis = createEditorViewExtensionApis(
    viewEditor,
    sourceEditor
  ) as Pick<Editor<V, TExtensions>, 'api' | 'extension'>;
  return Object.freeze(view);
};

/** Create a root-scoped editor view while preserving layered capabilities. */
export const createEditorView = createEditorViewRuntime as CreateEditorView;
