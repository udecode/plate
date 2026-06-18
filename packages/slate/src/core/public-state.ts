import { node as getNode } from '../editor/node';
import { nodes as getNodes } from '../editor/nodes';
import { pathRefs } from '../editor/path-refs';
import { pointRefs } from '../editor/point-refs';
import {
  allRangeRefs,
  publishRangeRefDrafts,
  resetRangeRefDrafts,
} from '../editor/range-ref';
import type {
  CreateEditorOptions,
  Editor,
  EditorCommit,
  EditorCommitCommand,
  EditorCommitContext,
  EditorCommitHandler,
  EditorCoreStateView,
  EditorCoreUpdateTransaction,
  EditorDocumentValue,
  EditorFragmentReadOptions,
  EditorMarks,
  EditorNodesOptions,
  EditorNormalizerTransaction,
  EditorSnapshot,
  EditorStateField,
  EditorStateNodesApi,
  EditorStatePatch,
  EditorStateView,
  EditorTransaction,
  EditorUpdateContext,
  EditorUpdateMetadata,
  EditorUpdateOptions,
  EditorUpdateTag,
  EditorUpdateTransaction,
  RootKey,
  RuntimeId,
  Selection,
  SnapshotIndex,
  SnapshotInput,
  StateFieldValueInput,
  Value,
} from '../interfaces/editor';
import type { Location, Span } from '../interfaces/location';
import {
  type Ancestor,
  type Descendant,
  type DescendantIn,
  NodeApi,
  type NodeEntry,
  type Node as SlateNode,
} from '../interfaces/node';
import { type Operation, OperationApi } from '../interfaces/operation';
import { type Path, PathApi } from '../interfaces/path';
import { PathRefApi } from '../interfaces/path-ref';
import { PointApi } from '../interfaces/point';
import { PointRefApi } from '../interfaces/point-ref';
import { RangeApi } from '../interfaces/range';
import { RangeRefApi } from '../interfaces/range-ref';
import type { Text } from '../interfaces/text';
import { transform as transformOperation } from '../interfaces/transforms/general';
import { createSetSelectionOperation } from '../selection-operation';
import {
  getOrCreateRuntimeId,
  seedRuntimeIds,
  seedRuntimeIdsFromIndex,
  setRuntimeId,
} from '../utils/runtime-ids';
import { cloneFrozen, cloneValue } from './clone';
import { buildDirtyRegion, completeCommit } from './commit-shape';
import { getEditorRuntime, getEditorSchema } from './editor-runtime';
import { getExtensionRegistry } from './extension-registry';
import {
  cacheFullRootReplaceSnapshotIndexes,
  getFullRootReplaceCachedSnapshot,
} from './full-root-replace-cache';
import { cloneDocumentState, normalizeInitialValue } from './initial-value';
import {
  getCommitListeners,
  getSnapshotListeners,
  getSourceListeners,
  getSourcesForChange,
  hasListeners,
  hasSnapshotListeners,
  initializeListenerState,
} from './listener-state';
import {
  bumpRuntimeIndexVersion,
  clearLiveRuntimeIndexCache,
  getCachedLiveRuntimeIndex,
  getRuntimeIndexVersion,
  initializeRuntimeIndexState,
  operationInvalidatesRuntimeIndex,
  setLiveRuntimeIndexCache,
} from './live-runtime-index-state';
import {
  assertKnownReplayOperation,
  consumeInternalOwnedReplayOperation,
} from './operation-replay';
import {
  getPublicStateOperationRoot as getOperationRoot,
  withDefaultOperationRoot,
  withReplayOperationDefaultRoot,
  withRootLifecycleDefaults,
} from './operation-root-policy';
import {
  appendOperationStateOperation,
  clearPublicOperationStateCache,
  getBaseApplyState,
  getLiveOperations,
  getOperationStateOperations,
  hasOperationState,
  setBaseApplyState,
  setOperationStateOperations,
} from './operation-state';
import { profileCoreDuration } from './profiling';
import {
  createRootReplaceChildrenOperation,
  freezePublicCommitOperations,
  getPublicExplicitLocationRoot,
  getPublicExplicitRangeRoot,
  getPublicRootReadKey,
  getReadLocationRoot,
  MAIN_ROOT_KEY,
  requireMutableRoot,
  usesImplicitSelectionLocation,
} from './public-root';
import {
  executeQueryMiddleware,
  isExecutingQueryMiddleware,
} from './query-middleware';
import {
  buildCommitRuntimeDirtiness,
  getDecorationImpactRuntimeIds,
  getNodeImpactRuntimeIds,
  getOperationScopePaths,
  getSelectionImpactRuntimeIds,
  operationChangesTextContent,
  operationChangesTopLevelOrder,
  operationTouchesOnlyTopLevelPaths,
  uniqPaths,
  uniqRuntimeIds,
} from './runtime-impact';
import {
  getSelectionStateMarks,
  getSelectionStateRoot,
  getSelectionStateSelection,
  initializeSelectionState,
  setSelectionStateMarks,
  setSelectionStateSelection,
} from './selection-state';
import {
  buildLiveRuntimeIndex,
  buildSnapshotIndex,
  buildSnapshotIndexWithLiveRuntimeIndex,
  EMPTY_RUNTIME_INDEX,
  type LiveRuntimeIndex,
  pathKey,
  type RuntimeIndexLike,
} from './snapshot-index';
import {
  assertStateFieldPatchPolicy,
  createStateFieldPatch,
  getStateFieldMap,
  initializeStateFieldMap,
  isCompactStatePatch,
  resolveStateFieldInitial,
  resolveStateFieldValue,
} from './state-fields';
import { resolveTargetRuntimeImplicitTarget } from './target-runtime';
import { getEditorTransformRegistry } from './transform-registry';
import {
  cloneUpdateMetadata,
  getCommandContext as getCommandContextState,
  getCurrentUpdateTags,
  mergeUpdateMetadata,
  normalizeUpdateTags,
  popCommandContext,
  popUpdateTagContext,
  pushCommandContext,
  pushUpdateTagContext,
} from './update-context';

export {
  getCachedFullRootReplaceTopLevelRuntimeIds,
  hasCachedFullRootReplaceSnapshotIndex,
} from './full-root-replace-cache';
export {
  hasListeners,
  hasSnapshotListeners,
  subscribe,
  subscribeCommit,
  subscribeSource,
} from './listener-state';
export { markInternalOwnedReplayOperation } from './operation-replay';
export { profileCoreDuration } from './profiling';
export {
  getTargetRuntime,
  setTargetRuntime,
  withEditorTargetRuntime,
} from './target-runtime';

export type TransactionAuthority = 'explicit' | 'replace' | 'update';

type TransactionSnapshot = {
  afterCommitHandlers: TransactionAfterCommitHandler[];
  children: readonly Descendant[];
  childrenRoot: string;
  marks: EditorMarks | null;
  metadata: EditorUpdateMetadata;
  operationStart: number;
  documentState: Record<string, unknown> | undefined;
  rootIndexes: Record<string, RuntimeIndexLike>;
  roots: Record<string, Descendant[]>;
  statePatches: EditorStatePatch[];
  tags: Set<EditorUpdateTag>;
  implicitTarget: Selection;
  implicitTargetResolved: boolean;
  previousIndex: RuntimeIndexLike | null;
  previousLiveIndex: LiveRuntimeIndex | null;
  previousSnapshot: EditorSnapshot | null;
  previousVersion: number;
  command: EditorCommitCommand | null;
  reason: 'replace' | null;
  selection: Selection;
  selectionRoot: string;
};

type TransactionAfterCommitHandler = {
  handler: EditorCommitHandler;
  root: string;
};

type MaterializedAfterCommitHandler = {
  context: EditorCommitContext;
  handler: EditorCommitHandler;
};

const CHILDREN = new WeakMap<Editor, Descendant[]>();
const ROOTS = new WeakMap<Editor, Record<string, Descendant[]>>();
const DOCUMENT_STATE = new WeakMap<
  Editor,
  Record<string, unknown> | undefined
>();
const LAST_COMMIT = new WeakMap<Editor, EditorCommit | null>();
const SNAPSHOT_CACHE = new WeakMap<Editor, EditorSnapshot>();
const TRANSACTION_CHANGED = new WeakMap<Editor, boolean>();
const TRANSACTION_APPLY = new WeakMap<Editor, (operation: Operation) => void>();
const TRANSACTION_SNAPSHOT = new WeakMap<Editor, TransactionSnapshot>();
const TRANSACTION_VIEW = new WeakMap<Editor, EditorTransaction>();
const ACTIVE_CHILDREN_ROOT = new WeakMap<Editor, string>();
const CURRENT_CHILDREN_ROOT = new WeakMap<Editor, string>();
const ACTIVE_OPERATION_ROOT = new WeakMap<Editor, string>();
const DEFAULT_IS_NORMALIZING = new WeakMap<Editor, unknown>();
const DEFAULT_NORMALIZE_NODE = new WeakMap<Editor, unknown>();
const DEFAULT_SHOULD_NORMALIZE = new WeakMap<Editor, unknown>();
const MUTATION_VERSION = new WeakMap<Editor, number>();
const READ_DEPTH = new WeakMap<Editor, number>();
const SNAPSHOT_VERSION = new WeakMap<Editor, number>();
const TRANSACTION_DEPTH = new WeakMap<Editor, number>();

export const getEditorChildrenRoot = (editor: Editor): string | undefined =>
  ACTIVE_CHILDREN_ROOT.get(editor);

export const getActiveOperationRoot = (editor: Editor): string | undefined =>
  ACTIVE_OPERATION_ROOT.get(editor);

export const withEditorOperationRoot = <T>(
  editor: Editor,
  root: string,
  fn: () => T
): T => {
  const previousRoot = ACTIVE_OPERATION_ROOT.get(editor);
  ACTIVE_OPERATION_ROOT.set(editor, root);

  try {
    return fn();
  } finally {
    if (previousRoot === undefined) {
      ACTIVE_OPERATION_ROOT.delete(editor);
    } else {
      ACTIVE_OPERATION_ROOT.set(editor, previousRoot);
    }
  }
};

export const getEditorOperationRoot = (editor: Editor): string =>
  ACTIVE_OPERATION_ROOT.get(editor) ?? MAIN_ROOT_KEY;

export const isInTransaction = (editor: Editor) =>
  getEditorTransactionDepth(editor) > 0;

export const getEditorReadDepth = (editor: Editor) =>
  READ_DEPTH.get(editor) ?? 0;

export const getEditorTransactionDepth = (editor: Editor) =>
  TRANSACTION_DEPTH.get(editor) ?? 0;

export const enterEditorRead = (editor: Editor) => {
  const depth = getEditorReadDepth(editor);
  READ_DEPTH.set(editor, depth + 1);

  return () => {
    if (depth === 0) {
      READ_DEPTH.delete(editor);
    } else {
      READ_DEPTH.set(editor, depth);
    }
  };
};

export const incrementEditorTransactionDepth = (
  editor: Editor,
  depth: number
) => {
  TRANSACTION_DEPTH.set(editor, depth + 1);
};

export const decrementEditorTransactionDepth = (editor: Editor) => {
  const nextDepth = (TRANSACTION_DEPTH.get(editor) ?? 1) - 1;
  TRANSACTION_DEPTH.set(editor, nextDepth);

  return nextDepth;
};

export const assertCanStartEditorWrite = (
  editor: Editor,
  authority?: TransactionAuthority
) => {
  if (isInTransaction(editor)) {
    return;
  }

  if (getEditorReadDepth(editor) > 0) {
    throw new Error('editor writes cannot be started inside editor.read');
  }

  if (!authority) {
    throw new Error('editor writes must run inside editor.update');
  }
};

const getVersion = (editor: Editor) => SNAPSHOT_VERSION.get(editor) ?? 0;

export const getMutationVersion = (editor: Editor) =>
  MUTATION_VERSION.get(editor) ?? 0;

export const getSnapshotVersion = (editor: Editor) => getVersion(editor);

const setSnapshotVersion = (editor: Editor, version: number) => {
  SNAPSHOT_VERSION.set(editor, version);
};

const bumpMutationVersion = (editor: Editor) => {
  MUTATION_VERSION.set(editor, getMutationVersion(editor) + 1);
};

const initializeVersionState = (editor: Editor) => {
  MUTATION_VERSION.set(editor, 0);
  setSnapshotVersion(editor, 0);
};

const initializeNormalizationFastPath = (editor: Editor) => {
  const runtime = getEditorRuntime(editor);

  DEFAULT_IS_NORMALIZING.set(editor, runtime.isNormalizing);
  DEFAULT_NORMALIZE_NODE.set(editor, runtime.normalizeNode);
  DEFAULT_SHOULD_NORMALIZE.set(editor, runtime.shouldNormalize);
};

export const canUseTextFastPath = (editor: Editor) => {
  const runtime = getEditorRuntime(editor);

  return (
    runtime.normalizeNode === DEFAULT_NORMALIZE_NODE.get(editor) &&
    runtime.shouldNormalize === DEFAULT_SHOULD_NORMALIZE.get(editor) &&
    runtime.isNormalizing === DEFAULT_IS_NORMALIZING.get(editor)
  );
};

const createEditorDocumentValue = <V extends Value>({
  children,
  fields,
  roots,
  state,
}: {
  children: V;
  fields: ReadonlyMap<string, Pick<EditorStateField, 'persist'>>;
  roots: Record<string, Descendant[]>;
  state: Record<string, unknown> | undefined;
}): EditorDocumentValue<V> => {
  const mainChildren = (roots[MAIN_ROOT_KEY] ?? children) as V;
  const extraRoots = Object.fromEntries(
    Object.entries(roots).filter(([key]) => key !== MAIN_ROOT_KEY)
  ) as Record<string, V>;
  const persistentState =
    state === undefined
      ? undefined
      : Object.fromEntries(
          Object.entries(state).filter(
            ([key]) => fields.get(key)?.persist !== false
          )
        );
  const hasExtraRoots = Object.keys(extraRoots).length > 0;
  const hasPersistentState =
    persistentState !== undefined && Object.keys(persistentState).length > 0;
  const value = {
    children: cloneFrozen(mainChildren),
    ...(hasExtraRoots ? { roots: cloneFrozen(extraRoots) } : {}),
    ...(hasPersistentState ? { state: cloneFrozen(persistentState) } : {}),
  };

  return Object.freeze(value) as EditorDocumentValue<V>;
};

const getCurrentChildrenRoot = (editor: Editor): string =>
  CURRENT_CHILDREN_ROOT.get(editor) ?? MAIN_ROOT_KEY;

const withLocationRootRead = <T>(
  editor: Editor,
  location: Location | Span | undefined,
  fn: () => T,
  options?: { selectionFallback?: boolean }
): T => {
  const root =
    getReadLocationRoot(location) ??
    getEditorChildrenRoot(editor) ??
    (options?.selectionFallback && getCurrentSelection(editor)
      ? getCurrentSelectionRoot(editor)
      : undefined);

  return root ? withEditorRootChildren(editor, root, fn) : fn();
};

const withOptionsRootRead = <T>(
  editor: Editor,
  options: { at?: Location | Span } | undefined,
  fn: () => T,
  queryOptions?: { selectionFallback?: boolean }
): T => withLocationRootRead(editor, options?.at, fn, queryOptions);

const withOptionsRootGenerator = <T>(
  editor: Editor,
  options: { at?: Location | Span } | undefined,
  create: () => Iterable<T>,
  queryOptions?: { selectionFallback?: boolean }
): Generator<T, void, undefined> =>
  (function* rootedReadGenerator() {
    const root =
      getReadLocationRoot(options?.at) ??
      getEditorChildrenRoot(editor) ??
      (queryOptions?.selectionFallback && getCurrentSelection(editor)
        ? getCurrentSelectionRoot(editor)
        : undefined);

    if (root) {
      yield* withEditorRootChildrenGenerator(editor, root, create);
      return;
    }

    yield* create();
  })();

const areSerializableValuesEqual = (left: unknown, right: unknown): boolean => {
  if (Object.is(left, right)) {
    return true;
  }

  try {
    return JSON.stringify(left) === JSON.stringify(right);
  } catch {
    return false;
  }
};

export const registerStateField = <TValue>(
  editor: Editor,
  field: EditorStateField<TValue>
) => {
  getStateFieldMap(editor).set(field.key, field);

  const existingState = DOCUMENT_STATE.get(editor);

  if (existingState && Object.hasOwn(existingState, field.key)) {
    return;
  }

  const initial = resolveStateFieldInitial(field);

  if (initial === undefined) {
    return;
  }

  DOCUMENT_STATE.set(editor, {
    ...(existingState ?? {}),
    [field.key]: cloneValue(initial),
  });
};

const getStateFieldValue = <TValue>(
  editor: Editor,
  field: EditorStateField<TValue>
): TValue => {
  if (!getStateFieldMap(editor).has(field.key)) {
    registerStateField(editor, field);
  }

  const state = DOCUMENT_STATE.get(editor);

  if (state && Object.hasOwn(state, field.key)) {
    return cloneFrozen(state[field.key]) as TValue;
  }

  return cloneFrozen(resolveStateFieldInitial(field)) as TValue;
};

const createStatePatch = (
  editor: Editor,
  key: string,
  previousValue: unknown,
  nextValue: unknown
): EditorStatePatch => {
  const field = getStateFieldMap(editor).get(key);

  return createStateFieldPatch(field, key, previousValue, nextValue);
};

const setStateFieldValue = <TValue>(
  editor: Editor,
  field: EditorStateField<TValue>,
  value: StateFieldValueInput<TValue>
) => {
  registerStateField(editor, field);

  const previousValue = getStateFieldValue(editor, field);
  const nextValue = resolveStateFieldValue(previousValue, value);

  if (Object.is(previousValue, nextValue)) {
    return;
  }

  assertStateFieldPatchPolicy(field, previousValue, nextValue);

  setStateValueByKey(editor, field.key, nextValue, previousValue);
};

const setStateValueByKey = (
  editor: Editor,
  key: string,
  nextValue: unknown,
  previousValue = DOCUMENT_STATE.get(editor)?.[key]
) => {
  const existingState = DOCUMENT_STATE.get(editor);
  const hadKey = existingState ? Object.hasOwn(existingState, key) : false;

  if (
    Object.is(previousValue, nextValue) &&
    (nextValue !== undefined || !hadKey)
  ) {
    return;
  }

  const nextState = { ...(existingState ?? {}) };

  if (nextValue === undefined) {
    delete nextState[key];
  } else {
    nextState[key] = cloneValue(nextValue);
  }

  if (Object.keys(nextState).length === 0) {
    DOCUMENT_STATE.delete(editor);
  } else {
    DOCUMENT_STATE.set(editor, nextState);
  }

  const snapshot = TRANSACTION_SNAPSHOT.get(editor);
  if (snapshot) {
    const patchIndex = snapshot.statePatches.findIndex(
      (statePatch) => statePatch.key === key
    );
    const baseline =
      snapshot.documentState && Object.hasOwn(snapshot.documentState, key)
        ? snapshot.documentState[key]
        : undefined;

    if (areSerializableValuesEqual(baseline, nextValue)) {
      if (patchIndex >= 0) {
        snapshot.statePatches.splice(patchIndex, 1);
      }
    } else {
      const nextPatch = createStatePatch(editor, key, baseline, nextValue);

      if (patchIndex >= 0) {
        snapshot.statePatches[patchIndex] = nextPatch;
      } else {
        snapshot.statePatches.push(nextPatch);
      }
    }
  }

  markTransactionChanged(editor);
};

export const applyStatePatches = (
  editor: Editor,
  patches: readonly EditorStatePatch[],
  direction: 'redo' | 'undo'
) => {
  const orderedPatches =
    direction === 'undo' ? [...patches].reverse() : patches;

  for (const patch of orderedPatches) {
    const field = getStateFieldMap(editor).get(patch.key);

    if (isCompactStatePatch(patch)) {
      if (!field?.applyPatch) {
        throw new Error(
          `State field "${patch.key}" cannot replay a compact patch without applyPatch.`
        );
      }

      const patchValue =
        direction === 'undo' ? patch.inversePatch : patch.patch;
      const previousValue = getStateFieldValue(editor, field);
      const nextValue = field.applyPatch(previousValue, patchValue);

      setStateValueByKey(editor, patch.key, nextValue, previousValue);
      continue;
    }

    setStateValueByKey(
      editor,
      patch.key,
      direction === 'undo' ? patch.previousValue : patch.value
    );
  }
};

export const shouldSaveStatePatch = (
  editor: Editor,
  patch: EditorStatePatch
): boolean => getStateFieldMap(editor).get(patch.key)?.history !== 'skip';

export const getCollabStatePatches = (
  editor: Editor,
  commit: EditorCommit
): readonly EditorStatePatch[] =>
  cloneFrozen(
    commit.statePatches.filter(
      (patch) => getStateFieldMap(editor).get(patch.key)?.collab === 'shared'
    )
  );

const getImplicitSelectionRoot = (editor: Editor): string | undefined =>
  getCurrentSelection(editor) ? getCurrentSelectionRoot(editor) : undefined;

const getActiveMutationRoot = (editor: Editor): string | undefined =>
  ACTIVE_CHILDREN_ROOT.get(editor) ?? getActiveOperationRoot(editor);

const getMutationRoot = (
  editor: Editor,
  options?: { at?: Location }
): string | undefined => {
  if (options?.at !== undefined) {
    return getPublicExplicitLocationRoot(options.at);
  }

  const activeRoot = getActiveMutationRoot(editor);
  const selectionRoot = getImplicitSelectionRoot(editor);

  if (!selectionRoot) {
    return activeRoot;
  }

  if (!activeRoot || activeRoot === selectionRoot) {
    return selectionRoot;
  }

  const transactionSnapshot = TRANSACTION_SNAPSHOT.get(editor);

  return transactionSnapshot &&
    transactionSnapshot.selectionRoot !== selectionRoot
    ? selectionRoot
    : activeRoot;
};

const getLocationMutationRoot = (
  editor: Editor,
  location: Location
): string | undefined =>
  getPublicExplicitLocationRoot(location) ??
  getActiveMutationRoot(editor) ??
  MAIN_ROOT_KEY;

const runWithMutationRoot = <T>(
  editor: Editor,
  root: string | undefined,
  fn: () => T
): T =>
  profileCoreDuration('mutation-root', () =>
    root
      ? withEditorOperationRoot(editor, root, () =>
          withEditorOperationRootChildren(editor, root, fn)
        )
      : fn()
  );

const getLiveRuntimeIndex = (editor: Editor) => {
  const version = getRuntimeIndexVersion(editor);
  const cached = getCachedLiveRuntimeIndex(editor);

  if (cached?.version === version) {
    return cached.index;
  }

  const index = buildLiveRuntimeIndex(editor, getChildren(editor));
  setLiveRuntimeIndexCache(editor, index);
  return index;
};

const getLiveRuntimeIdAtPath = (
  editor: Editor,
  path: Path
): RuntimeId | null => {
  if (path.length === 0) {
    return null;
  }

  const node = getLiveNode(editor, path);

  return node && typeof node === 'object'
    ? getOrCreateRuntimeId(node, editor)
    : null;
};

const getLiveRuntimeIdAtRootPath = (
  editor: Editor,
  root: string,
  path: Path
): RuntimeId | null => {
  if (path.length === 0) {
    return null;
  }

  const node = NodeApi.getIf(
    {
      children: getEditorDocumentRoots(editor)[root] ?? [],
    } as unknown as SlateNode,
    path
  );

  return node && typeof node === 'object'
    ? getOrCreateRuntimeId(node, editor)
    : null;
};

const setVersion = (editor: Editor, version: number) => {
  setSnapshotVersion(editor, version);
  SNAPSHOT_CACHE.delete(editor);
};

const withUpdateTagContext = <T>(
  editor: Editor,
  tags: readonly EditorUpdateTag[],
  fn: () => T
) => {
  if (tags.length === 0) {
    return fn();
  }

  pushUpdateTagContext(editor, tags);

  const snapshot = TRANSACTION_SNAPSHOT.get(editor);

  if (snapshot) {
    for (const tag of tags) {
      snapshot.tags.add(tag);
    }
  }

  try {
    return fn();
  } finally {
    popUpdateTagContext(editor);
  }
};

export const getCommandContext = (editor: Editor): EditorCommitCommand | null =>
  getCommandContextState(editor);

export const withCommandContext = <T>(
  editor: Editor,
  command: EditorCommitCommand,
  fn: () => T
): T => {
  const transactionSnapshot = TRANSACTION_SNAPSHOT.get(editor);

  if (transactionSnapshot && transactionSnapshot.command === null) {
    transactionSnapshot.command = cloneValue(command);
  }

  pushCommandContext(editor, command);

  try {
    return fn();
  } finally {
    popCommandContext(editor);
  }
};

export const markTransactionChanged = (editor: Editor) => {
  if (isInTransaction(editor)) {
    TRANSACTION_CHANGED.set(editor, true);
  }
};

const hasTransactionNetChanges = (
  editor: Editor,
  snapshot: TransactionSnapshot | undefined
): boolean => {
  if (!snapshot) {
    return true;
  }

  if (getLiveOperations(editor).length !== snapshot.operationStart) {
    return true;
  }

  if (snapshot.statePatches.length > 0) {
    return true;
  }

  return (
    !areSerializableValuesEqual(
      getEditorDocumentRoots(editor),
      snapshot.roots
    ) ||
    !areSerializableValuesEqual(
      DOCUMENT_STATE.get(editor),
      snapshot.documentState
    ) ||
    !areSerializableValuesEqual(getCurrentMarks(editor), snapshot.marks) ||
    !areSerializableValuesEqual(
      getCurrentSelection(editor),
      snapshot.selection
    ) ||
    getCurrentSelectionRoot(editor) !== snapshot.selectionRoot
  );
};

export const getChildren = <V extends Value>(editor: Editor<V>): V =>
  (CHILDREN.get(editor) ?? []) as V;

const getEditorDocumentRoots = (
  editor: Editor
): Record<string, Descendant[]> => {
  const children = getChildren(editor) as Descendant[];
  const storedRoots = ROOTS.get(editor);

  if (!storedRoots) {
    return {
      [MAIN_ROOT_KEY]: children,
    };
  }

  const currentRoot = getCurrentChildrenRoot(editor);

  if (!Object.hasOwn(storedRoots, currentRoot)) {
    return storedRoots;
  }

  return storedRoots[currentRoot] === children
    ? storedRoots
    : {
        ...storedRoots,
        [currentRoot]: children,
      };
};

const getEditorDocumentValue = <V extends Value>(
  editor: Editor<V>
): EditorDocumentValue<V> =>
  createEditorDocumentValue({
    children: getChildren(editor),
    fields: getStateFieldMap(editor),
    roots: getEditorDocumentRoots(editor),
    state: DOCUMENT_STATE.get(editor),
  });

export const getLiveNode = (
  editor: Editor,
  path: Path
): SlateNode | undefined => {
  if (path.length === 0) {
    return editor;
  }

  let node: SlateNode | undefined;
  let children: Descendant[] = getChildren(editor);

  for (let index = 0; index < path.length; index += 1) {
    node = children[path[index]!];

    if (!node) {
      return;
    }

    if (index === path.length - 1) {
      return node;
    }

    if (!('children' in node) || !Array.isArray(node.children)) {
      return;
    }

    children = node.children;
  }

  return node;
};

export const getLiveText = (editor: Editor, path: Path): Text | null => {
  const node = getLiveNode(editor, path);

  return node && 'text' in node && typeof node.text === 'string'
    ? (node as Text)
    : null;
};

export const getLiveSelection = (editor: Editor): Selection =>
  getCurrentSelection(editor);

export const getRuntimeId = (editor: Editor, path: Path): RuntimeId | null => {
  if (path.length === 0) {
    return null;
  }

  const indexedRuntimeId = getLiveRuntimeIndex(editor).pathToId.get(
    pathKey(path)
  );

  if (indexedRuntimeId) {
    return indexedRuntimeId;
  }

  return getLiveRuntimeIdAtPath(editor, path);
};

export const getPathByRuntimeId = (
  editor: Editor,
  runtimeId: RuntimeId
): Path | null => {
  const path = getLiveRuntimeIndex(editor).idToPath.get(runtimeId);

  return path ? ([...path] as Path) : null;
};

export const getOperationDirtiness = (
  editor: Editor,
  operations: readonly Operation[],
  {
    command = getCommandContext(editor),
    marksBefore = getCurrentMarks(editor),
    previousIndex,
    previousVersion = getVersion(editor),
    reason = null,
    selectionBefore = getCurrentSelection(editor),
    nextIndex,
    metadata = {},
    statePatches = [],
    tags = getCurrentUpdateTags(editor),
  }: {
    command?: EditorCommitCommand | null;
    marksBefore?: EditorMarks | null;
    metadata?: EditorUpdateMetadata;
    nextIndex?: RuntimeIndexLike;
    previousIndex?: RuntimeIndexLike;
    previousVersion?: number;
    reason?: 'replace' | null;
    selectionBefore?: Selection;
    statePatches?: readonly EditorStatePatch[];
    tags?: readonly EditorUpdateTag[];
  } = {}
): EditorCommit => {
  const hasTextOperation = operations.some(
    (op) => op.type === 'insert_text' || op.type === 'remove_text'
  );
  const hasReplaceFragmentOperation = operations.some(
    (op) => op.type === 'replace_fragment'
  );
  const hasStructuralTextOperation = operations.some(
    operationChangesTextContent
  );
  const classes =
    reason === 'replace' || hasReplaceFragmentOperation
      ? (['replace'] as const)
      : operations.length > 0 &&
          operations.every((op) => op.type === 'set_selection')
        ? (['selection'] as const)
        : hasTextOperation &&
            operations.every(
              (op) =>
                op.type === 'insert_text' ||
                op.type === 'remove_text' ||
                op.type === 'set_selection'
            )
          ? (['text'] as const)
          : operations.length > 0
            ? hasStructuralTextOperation
              ? (['structural', 'text'] as const)
              : (['structural'] as const)
            : statePatches.length > 0
              ? (['state'] as const)
              : (['mark'] as const);
  const dirtyPaths =
    classes[0] === 'text'
      ? uniqPaths(
          operations.flatMap((op) =>
            'path' in op && Array.isArray(op.path)
              ? [[], op.path.slice(0, -1), op.path]
              : []
          )
        )
      : [];
  const operationRoot = getHomogeneousOperationRoot(operations);
  const dirtyRoot =
    operationRoot === null ? null : (operationRoot ?? MAIN_ROOT_KEY);
  const topLevelOrderChanged =
    classes[0] === 'structural' &&
    operations.some(operationChangesTopLevelOrder);
  const topLevelOnlyStructuralChange =
    classes[0] === 'structural' &&
    operations.every(operationTouchesOnlyTopLevelPaths);
  const pathStableStructuralChange =
    classes[0] === 'structural' &&
    operations.every((operation) => operation.type === 'set_node');
  const sparseStructuralRuntimeIndex = pathStableStructuralChange
    ? buildSparseRuntimeIndexForPaths(
        editor,
        uniqPaths([
          ...getOperationScopePaths(operations),
          ...getOperationScopePaths(operations)
            .filter((path) => path.length > 0)
            .map((path) => [path[0]!] as Path),
        ]),
        dirtyRoot ?? MAIN_ROOT_KEY
      )
    : null;
  const shouldComputeSelectionImpact =
    hasListeners(editor) ||
    getExtensionRegistry(editor).commitListeners.size > 0;
  const skipSelectionRuntimeIndexes =
    classes[0] === 'selection' && !shouldComputeSelectionImpact;
  const touchedRuntimeIds =
    classes[0] === 'replace'
      ? null
      : classes[0] === 'selection' || classes[0] === 'mark'
        ? []
        : topLevelOrderChanged
          ? getTopLevelOrderTouchedRuntimeIds(editor, operations)
          : uniqPaths(
              operations.flatMap((op) =>
                'path' in op && Array.isArray(op.path) ? [op.path] : []
              )
            )
              .map((path) => {
                const key = pathKey(path);
                const touchedIndex =
                  sparseStructuralRuntimeIndex ?? previousIndex;
                const previousRuntimeId = touchedIndex
                  ? touchedIndex.pathToId instanceof Map
                    ? touchedIndex.pathToId.get(key)
                    : touchedIndex.pathToId[key]
                  : undefined;

                return (
                  previousRuntimeId ??
                  (dirtyRoot
                    ? getLiveRuntimeIdAtRootPath(editor, dirtyRoot, path)
                    : getLiveRuntimeIdAtPath(editor, path))
                );
              })
              .filter(Boolean);
  const marksAfter = getCurrentMarks(editor);
  const selectionAfter = getCurrentSelection(editor);
  const marksChanged =
    classes[0] === 'mark' ||
    JSON.stringify(marksBefore ?? null) !== JSON.stringify(marksAfter ?? null);
  const selectionChanged =
    operations.some((op) => op.type === 'set_selection') ||
    JSON.stringify(selectionBefore ?? null) !==
      JSON.stringify(selectionAfter ?? null);
  const canUseSparseTextRuntimeIndex =
    classes[0] === 'text' &&
    (!selectionBefore || RangeApi.isCollapsed(selectionBefore)) &&
    (!selectionAfter || RangeApi.isCollapsed(selectionAfter));
  const sparseTextRuntimeIndex = canUseSparseTextRuntimeIndex
    ? buildSparseRuntimeIndexForPaths(
        editor,
        dirtyPaths,
        dirtyRoot ?? MAIN_ROOT_KEY
      )
    : null;
  const canSkipRuntimeIndexes =
    topLevelOrderChanged ||
    topLevelOnlyStructuralChange ||
    pathStableStructuralChange ||
    canUseSparseTextRuntimeIndex ||
    skipSelectionRuntimeIndexes;
  const previousRuntimeIndex = canSkipRuntimeIndexes
    ? (sparseTextRuntimeIndex ??
      sparseStructuralRuntimeIndex ??
      previousIndex ??
      EMPTY_RUNTIME_INDEX)
    : (previousIndex ?? getSnapshot(editor).index);
  const nextRuntimeIndex =
    nextIndex ??
    (canSkipRuntimeIndexes && classes[0] === 'structural'
      ? previousRuntimeIndex
      : sparseTextRuntimeIndex
        ? previousRuntimeIndex
        : getLiveRuntimeIndex(editor));
  const selectionImpactRuntimeIds =
    classes[0] === 'replace' ||
    topLevelOrderChanged ||
    (classes[0] === 'structural' && !selectionChanged) ||
    skipSelectionRuntimeIndexes
      ? null
      : getSelectionImpactRuntimeIds({
          nextIndex: nextRuntimeIndex,
          previousIndex: previousRuntimeIndex,
          selectionAfter,
          selectionBefore,
        });
  const decorationImpactRuntimeIds = getDecorationImpactRuntimeIds({
    classes,
    dirtyPaths,
    nextIndex: nextRuntimeIndex,
    previousIndex: previousRuntimeIndex,
    selectionImpactRuntimeIds,
    touchedRuntimeIds:
      touchedRuntimeIds == null ? null : (touchedRuntimeIds as RuntimeId[]),
  });
  const nodeImpactRuntimeIds = getNodeImpactRuntimeIds({
    classes,
    dirtyPaths,
    nextIndex: nextRuntimeIndex,
    operations,
    previousIndex: previousRuntimeIndex,
    touchedRuntimeIds:
      touchedRuntimeIds == null ? null : (touchedRuntimeIds as RuntimeId[]),
  });
  const dirtyScope =
    classes[0] === 'replace'
      ? 'all'
      : classes[0] === 'selection' ||
          classes[0] === 'mark' ||
          classes[0] === 'state'
        ? 'none'
        : 'paths';

  return completeCommit(
    {
      ...buildCommitRuntimeDirtiness({
        classes,
        decorationImpactRuntimeIds,
        dirtyPaths,
        dirtyScope,
        nextIndex: nextRuntimeIndex,
        nodeImpactRuntimeIds,
        operations,
        previousIndex: previousRuntimeIndex,
        selectionImpactRuntimeIds,
        touchedRuntimeIds:
          touchedRuntimeIds == null ? null : (touchedRuntimeIds as RuntimeId[]),
      }),
      childrenChanged:
        classes[0] === 'replace' ||
        classes[0] === 'text' ||
        classes[0] === 'structural',
      classes,
      command: cloneValue(command),
      decorationImpactRuntimeIds,
      dirtyPaths,
      dirtyScope,
      dirtyStateKeys: Object.freeze(statePatches.map((patch) => patch.key)),
      marksAfter: cloneValue(marksAfter),
      marksBefore: cloneValue(marksBefore),
      marksChanged,
      metadata: cloneUpdateMetadata(metadata),
      nodeImpactRuntimeIds,
      operations: freezePublicCommitOperations(operations),
      replaceEpoch: classes[0] === 'replace' ? 1 : 0,
      selectionAfter: cloneValue(selectionAfter),
      selectionBefore: cloneValue(selectionBefore),
      selectionChanged,
      selectionImpactRuntimeIds,
      statePatches: Object.freeze(cloneValue([...statePatches])),
      tags: Object.freeze([...tags]),
      touchedRuntimeIds:
        touchedRuntimeIds == null
          ? null
          : Object.freeze(touchedRuntimeIds as RuntimeId[]),
    },
    { previousVersion, version: getVersion(editor) }
  );
};

export const getLastCommit = (editor: Editor): EditorCommit | null =>
  LAST_COMMIT.get(editor) ?? null;

const getSelectionMarks = <V extends Value>(
  editor: Editor<V>
): EditorMarks<V> | null => {
  const marks = getCurrentMarks(editor);
  const selection = getCurrentSelection(editor);

  if (!selection) {
    return null;
  }

  if (marks) {
    return marks as EditorMarks<V>;
  }

  return withEditorRootChildren(editor, getCurrentSelectionRoot(editor), () => {
    let { anchor, focus } = selection;

    if (RangeApi.isExpanded(selection)) {
      if (RangeApi.isBackward(selection)) {
        [focus, anchor] = [anchor, focus];
      }

      if (
        PointApi.equals(
          anchor,
          getEditorRuntime(editor).point(anchor.path, { edge: 'end' })
        )
      ) {
        const after = getEditorRuntime(editor).after(anchor);

        if (after) {
          anchor = after;
        }
      }

      const [match] = getNodes(editor, {
        at: { anchor, focus },
        match: NodeApi.isText,
      });

      if (match) {
        const [node] = match;
        const { text, ...rest } = node;

        return rest as EditorMarks<V>;
      }

      return {} as EditorMarks<V>;
    }

    const { path } = anchor;

    if (!getEditorRuntime(editor).hasPath(path)) {
      return null;
    }

    let [node] = getEditorRuntime(editor).leaf(path);

    if (anchor.offset === 0) {
      const prev = getEditorRuntime(editor).previous({
        at: path,
        match: NodeApi.isText,
      });
      const markedVoid = getEditorRuntime(editor).above({
        match: (n: SlateNode) =>
          NodeApi.isElement(n) &&
          getEditorSchema(editor).isVoid(n) &&
          getEditorSchema(editor).markableVoid(n),
      });

      if (!markedVoid) {
        const block = getEditorRuntime(editor).above({
          match: (n: SlateNode) =>
            NodeApi.isElement(n) && !getEditorSchema(editor).isInline(n),
        });

        if (prev && block) {
          const [prevNode, prevPath] = prev;
          const [, blockPath] = block;

          if (PathApi.isAncestor(blockPath, prevPath)) {
            node = prevNode;
          }
        }
      }
    }

    const { text, ...rest } = node;

    return rest as EditorMarks<V>;
  });
};

const createNodesToArray = (editor: Editor): EditorStateNodesApi['toArray'] => {
  function toArray<T extends SlateNode>(
    options?: EditorNodesOptions<T>
  ): NodeEntry<T>[];
  function toArray<T extends SlateNode, R>(
    options: EditorNodesOptions<T> | undefined,
    map: (entry: NodeEntry<T>) => R
  ): R[];
  function toArray<T extends SlateNode, R>(
    options: EditorNodesOptions<T> = {},
    map?: (entry: NodeEntry<T>) => R
  ): NodeEntry<T>[] | R[] {
    return executeQueryMiddleware(
      editor,
      'nodes',
      'toArray',
      {
        map: map as ((entry: NodeEntry<SlateNode>) => unknown) | undefined,
        options: options as EditorNodesOptions<SlateNode>,
      },
      ({ map, options = {} }) =>
        withOptionsRootRead(
          editor,
          options,
          () => {
            if (map) {
              const mapped: unknown[] = [];

              for (const entry of getNodes(editor, options)) {
                mapped.push(map(entry));
              }

              return mapped;
            }

            const entries: NodeEntry<SlateNode>[] = [];

            for (const entry of getNodes(editor, options)) {
              entries.push(entry);
            }

            return entries;
          },
          { selectionFallback: usesImplicitSelectionLocation(options) }
        )
    ) as NodeEntry<T>[] | R[];
  }

  return toArray;
};

const getStateView = <
  V extends Value,
  TExtensions extends readonly unknown[] = readonly [],
>(
  editor: Editor<V, TExtensions>
): EditorStateView<V, TExtensions> => {
  const state = {
    fragment: Object.freeze({
      get: (options = {}) =>
        executeQueryMiddleware(
          editor,
          'fragment',
          'get',
          { options },
          ({ options }) =>
            withOptionsRootRead(
              editor,
              options,
              () => getFragment(editor, options) as DescendantIn<V>[],
              { selectionFallback: usesImplicitSelectionLocation(options) }
            )
        ),
    }),
    getField: <TValue>(field: EditorStateField<TValue>) =>
      getStateFieldValue(editor, field),
    marks: Object.freeze({
      get: () =>
        executeQueryMiddleware(editor, 'marks', 'get', {}, () =>
          getSelectionMarks(editor)
        ),
    }),
    nodes: Object.freeze({
      above: <T extends Ancestor>(options = {}) =>
        executeQueryMiddleware(
          editor,
          'nodes',
          'above',
          { options },
          ({ options }) =>
            getEditorRuntime(editor).above(options) as
              | NodeEntry<Ancestor>
              | undefined
        ) as [T, Path] | undefined,
      children(at: Location = []) {
        return executeQueryMiddleware(
          editor,
          'nodes',
          'children',
          { at },
          ({ at = [] }) =>
            withLocationRootRead(editor, at, () => {
              if (Array.isArray(at) && at.length === 0) {
                return getChildren(editor) as readonly SlateNode[];
              }

              const [node] = getNode(editor, at);

              return 'children' in node && Array.isArray(node.children)
                ? node.children
                : [];
            })
        );
      },
      elementReadOnly: (options = {}) =>
        executeQueryMiddleware(
          editor,
          'nodes',
          'elementReadOnly',
          { options },
          ({ options }) => getEditorRuntime(editor).elementReadOnly(options)
        ),
      first: (at: Location) =>
        executeQueryMiddleware(editor, 'nodes', 'first', { at }, ({ at }) =>
          getEditorRuntime(editor).first(at)
        ),
      get: <T extends SlateNode>(at: Location) =>
        executeQueryMiddleware(editor, 'nodes', 'get', { at }, ({ at }) =>
          withLocationRootRead(editor, at, () => getNode(editor, at))
        ) as [T, Path],
      hasBlocks: (element: import('../interfaces/element').Element) =>
        executeQueryMiddleware(
          editor,
          'nodes',
          'hasBlocks',
          { element },
          ({ element }) => getEditorRuntime(editor).hasBlocks(element)
        ),
      hasInlines: (element: import('../interfaces/element').Element) =>
        executeQueryMiddleware(
          editor,
          'nodes',
          'hasInlines',
          { element },
          ({ element }) => getEditorRuntime(editor).hasInlines(element)
        ),
      hasPath: (path: Path) =>
        executeQueryMiddleware(
          editor,
          'nodes',
          'hasPath',
          { path },
          ({ path }) => getEditorRuntime(editor).hasPath(path)
        ),
      hasTexts: (element: import('../interfaces/element').Element) =>
        executeQueryMiddleware(
          editor,
          'nodes',
          'hasTexts',
          { element },
          ({ element }) => getEditorRuntime(editor).hasTexts(element)
        ),
      isBlock: (element: import('../interfaces/element').Element) =>
        executeQueryMiddleware(
          editor,
          'nodes',
          'isBlock',
          { element },
          ({ element }) => getEditorRuntime(editor).isBlock(element)
        ),
      isEmpty: (element: import('../interfaces/element').Element) =>
        executeQueryMiddleware(
          editor,
          'nodes',
          'isEmpty',
          { element },
          ({ element }) => getEditorRuntime(editor).isEmpty(element)
        ),
      last: (at: Location) =>
        executeQueryMiddleware(editor, 'nodes', 'last', { at }, ({ at }) =>
          getEditorRuntime(editor).last(at)
        ),
      leaf: (at, options = {}) =>
        executeQueryMiddleware(
          editor,
          'nodes',
          'leaf',
          { at, options },
          ({ at, options }) => getEditorRuntime(editor).leaf(at, options)
        ),
      levels: <T extends SlateNode>(options = {}) =>
        executeQueryMiddleware(
          editor,
          'nodes',
          'levels',
          { options },
          ({ options }) =>
            getEditorRuntime(editor).levels(options) as Generator<
              NodeEntry<SlateNode>,
              void,
              undefined
            >
        ) as Generator<[T, Path], void, undefined>,
      path: (at: Location, options = {}) =>
        executeQueryMiddleware(
          editor,
          'nodes',
          'path',
          { at, options },
          ({ at, options }) => getEditorRuntime(editor).path(at, options)
        ),
      entries: <T extends SlateNode>(options = {}) =>
        executeQueryMiddleware(
          editor,
          'nodes',
          'entries',
          { options },
          ({ options }) =>
            withOptionsRootGenerator(
              editor,
              options,
              () =>
                getNodes(editor, options) as Generator<
                  NodeEntry<SlateNode>,
                  void,
                  undefined
                >,
              { selectionFallback: usesImplicitSelectionLocation(options) }
            )
        ) as Generator<[T, Path], void, undefined>,
      find: <T extends SlateNode>(options = {}) =>
        executeQueryMiddleware(
          editor,
          'nodes',
          'find',
          { options },
          ({ options }) =>
            withOptionsRootRead(
              editor,
              options,
              () => {
                for (const entry of getNodes(editor, options)) {
                  return entry;
                }
              },
              { selectionFallback: usesImplicitSelectionLocation(options) }
            )
        ) as [T, Path] | undefined,
      some: (options = {}) =>
        executeQueryMiddleware(
          editor,
          'nodes',
          'some',
          { options },
          ({ options }) =>
            withOptionsRootRead(
              editor,
              options,
              () => {
                for (const _entry of getNodes(editor, options)) {
                  return true;
                }

                return false;
              },
              { selectionFallback: usesImplicitSelectionLocation(options) }
            )
        ),
      toArray: createNodesToArray(editor),
      next: <T extends SlateNode>(options = {}) =>
        executeQueryMiddleware(
          editor,
          'nodes',
          'next',
          { options },
          ({ options }) =>
            getEditorRuntime(editor).next(options) as
              | NodeEntry<Descendant>
              | undefined
        ) as [T, Path] | undefined,
      previous: <T extends SlateNode>(options = {}) =>
        executeQueryMiddleware(
          editor,
          'nodes',
          'previous',
          { options },
          ({ options }) =>
            getEditorRuntime(editor).previous(options) as
              | NodeEntry<SlateNode>
              | undefined
        ) as [T, Path] | undefined,
      shouldMergeNodesRemovePrevNode: (previous, current) =>
        executeQueryMiddleware(
          editor,
          'nodes',
          'shouldMergeNodesRemovePrevNode',
          { current, previous },
          ({ current, previous }) =>
            getEditorRuntime(editor).shouldMergeNodesRemovePrevNode(
              previous,
              current
            )
        ),
      parent: (at: Location) =>
        executeQueryMiddleware(editor, 'nodes', 'parent', { at }, ({ at }) =>
          getEditorRuntime(editor).parent(at)
        ),
      void: (options = {}) =>
        executeQueryMiddleware(
          editor,
          'nodes',
          'void',
          { options },
          ({ options }) => getEditorRuntime(editor).void(options)
        ),
    }),
    points: Object.freeze({
      after: (at: Location, options = {}) =>
        executeQueryMiddleware(
          editor,
          'points',
          'after',
          { at, options },
          ({ at, options }) => getEditorRuntime(editor).after(at, options)
        ),
      before: (at: Location, options = {}) =>
        executeQueryMiddleware(
          editor,
          'points',
          'before',
          { at, options },
          ({ at, options }) => getEditorRuntime(editor).before(at, options)
        ),
      end: (at: Location) =>
        executeQueryMiddleware(editor, 'points', 'end', { at }, ({ at }) =>
          getEditorRuntime(editor).point(at, { edge: 'end' })
        ),
      get: (at: Location, options = {}) =>
        executeQueryMiddleware(
          editor,
          'points',
          'get',
          { at, options },
          ({ at, options }) => getEditorRuntime(editor).point(at, options)
        ),
      isEdge: (point, at) =>
        executeQueryMiddleware(
          editor,
          'points',
          'isEdge',
          { at, point },
          ({ at, point }) => getEditorRuntime(editor).isEdge(point, at)
        ),
      isEnd: (point, at) =>
        executeQueryMiddleware(
          editor,
          'points',
          'isEnd',
          { at, point },
          ({ at, point }) => getEditorRuntime(editor).isEnd(point, at)
        ),
      isStart: (point, at) =>
        executeQueryMiddleware(
          editor,
          'points',
          'isStart',
          { at, point },
          ({ at, point }) => getEditorRuntime(editor).isStart(point, at)
        ),
      positions: (options = {}) =>
        executeQueryMiddleware(
          editor,
          'points',
          'positions',
          { options },
          ({ options }) => getEditorRuntime(editor).positions(options)
        ),
      start: (at: Location) =>
        executeQueryMiddleware(editor, 'points', 'start', { at }, ({ at }) =>
          getEditorRuntime(editor).point(at, { edge: 'start' })
        ),
    }),
    ranges: Object.freeze({
      bookmark: (range, options = {}) =>
        getEditorTransformRegistry(editor).bookmark(range, options),
      edges: (at: Location) =>
        executeQueryMiddleware(editor, 'ranges', 'edges', { at }, ({ at }) =>
          getEditorRuntime(editor).edges(at)
        ),
      get: (at: Location, to?: Location) =>
        executeQueryMiddleware(
          editor,
          'ranges',
          'get',
          { at, to },
          ({ at, to }) => getEditorRuntime(editor).range(at, to)
        ),
      project: (range) =>
        executeQueryMiddleware(
          editor,
          'ranges',
          'project',
          { range },
          ({ range }) => getEditorRuntime(editor).projectRange(range)
        ),
      unhang: (range, options = {}) =>
        executeQueryMiddleware(
          editor,
          'ranges',
          'unhang',
          { options, range },
          ({ options, range }) =>
            getEditorRuntime(editor).unhangRange(range, options)
        ),
    }),
    runtime: Object.freeze({
      idAt: (path: Path) => getRuntimeId(editor, path),
      pathOf: (runtimeId) => getPathByRuntimeId(editor, runtimeId),
      snapshot: () => getSnapshot(editor) as EditorSnapshot<V>,
    }),
    schema: Object.freeze({
      getElementBehavior: (element: import('../interfaces/element').Element) =>
        getEditorSchema(editor).getElementBehavior(element),
      getElementProperty: <T = unknown>(
        element: import('../interfaces/element').Element,
        property: string
      ) => getEditorSchema(editor).getElementProperty<T>(element, property),
      getElementPropertyDescriptor: (type: string, property: string) =>
        getEditorSchema(editor).getElementPropertyDescriptor(type, property),
      getElementSpec: (type: string) =>
        getEditorSchema(editor).getElementSpec(type),
      isAtom: (element: import('../interfaces/element').Element) =>
        getEditorSchema(editor).isAtom(element),
      isBlock: (element: import('../interfaces/element').Element) =>
        getEditorRuntime(editor).isBlock(element),
      isEditableIsland: (element: import('../interfaces/element').Element) =>
        getEditorSchema(editor).isEditableIsland(element),
      isElementPropertyEqual: (
        type: string,
        property: string,
        left: unknown,
        right: unknown
      ) =>
        getEditorSchema(editor).isElementPropertyEqual(
          type,
          property,
          left,
          right
        ),
      isReadOnly: (element: import('../interfaces/element').Element) =>
        getEditorSchema(editor).isReadOnly(element),
      isInline: (element: import('../interfaces/element').Element) =>
        getEditorSchema(editor).isInline(element),
      isIsolating: (element: import('../interfaces/element').Element) =>
        getEditorSchema(editor).isIsolating(element),
      isKeyboardSelectable: (
        element: import('../interfaces/element').Element
      ) => getEditorSchema(editor).isKeyboardSelectable(element),
      isSelectable: (element: import('../interfaces/element').Element) =>
        getEditorSchema(editor).isSelectable(element),
      isVoid: (element: import('../interfaces/element').Element) =>
        getEditorSchema(editor).isVoid(element),
      markableVoid: (element: import('../interfaces/element').Element) =>
        getEditorSchema(editor).markableVoid(element),
    }),
    selection: Object.freeze({
      get: () => getCurrentSelection(editor),
    }),
    text: Object.freeze({
      string: (at: Location, options = {}) =>
        withLocationRootRead(editor, at, () =>
          getEditorRuntime(editor).string(at, options)
        ),
    }),
    value: Object.freeze({
      get: () => getEditorDocumentValue(editor),
      lastCommit: () => getLastCommit(editor) as EditorCommit<V> | null,
      operations: (startIndex?: number) =>
        getOperations(editor, startIndex) as readonly Operation<V>[],
      root: (root?: RootKey) =>
        (getEditorDocumentRoots(editor)[getPublicRootReadKey(root)] ?? []) as V,
    }),
    view: Object.freeze({
      isFocused: () => false,
      isReadOnly: () => false,
      root: () => MAIN_ROOT_KEY,
    }),
  } satisfies EditorCoreStateView<V>;

  const stateRecord = state as unknown as Record<string, unknown>;

  for (const [groupName, registration] of getExtensionRegistry(editor)
    .stateGroups) {
    stateRecord[groupName] = registration.factory(
      stateRecord as never,
      editor as never
    );
  }

  return Object.freeze(stateRecord) as EditorStateView<V, TExtensions>;
};

export const getEditorStateView = <
  V extends Value,
  TExtensions extends readonly unknown[] = readonly [],
>(
  editor: Editor<V, TExtensions>
): EditorStateView<V, TExtensions> => getStateView(editor);

const getUpdateContext = <
  V extends Value,
  TExtensions extends readonly unknown[] = readonly [],
>(
  editor: Editor<V, TExtensions>
): EditorUpdateContext<Editor<V, TExtensions>> => {
  const transactionSnapshot = TRANSACTION_SNAPSHOT.get(editor);
  const transactionRoot = getCurrentChildrenRoot(editor);

  return Object.freeze({
    afterCommit(handler) {
      const snapshot = TRANSACTION_SNAPSHOT.get(editor);

      if (!snapshot || snapshot !== transactionSnapshot) {
        throw new Error(
          'afterCommit can only be registered during editor.update'
        );
      }

      snapshot.afterCommitHandlers.push({
        handler: handler as EditorCommitHandler,
        root: transactionRoot,
      });
    },
  });
};

const getUpdateView = <
  V extends Value,
  TExtensions extends readonly unknown[] = readonly [],
>(
  editor: Editor<V, TExtensions>
): EditorUpdateTransaction<V, TExtensions> => {
  const state = getStateView(editor);
  const transforms = getEditorTransformRegistry(editor);
  const runMutation = <T>(
    options: { at?: Location } | undefined,
    fn: () => T
  ) => runWithMutationRoot(editor, getMutationRoot(editor, options), fn);
  const runSelectionMutation = <T>(fn: () => T) =>
    runWithMutationRoot(editor, getMutationRoot(editor), fn);
  const runLocationMutation = <T>(location: Location, fn: () => T) =>
    runWithMutationRoot(editor, getLocationMutationRoot(editor, location), fn);
  const tx = {
    ...state,
    break: Object.freeze({
      insert: () => runSelectionMutation(() => transforms.insertBreak()),
      insertSoft: () =>
        runSelectionMutation(() => transforms.insertSoftBreak()),
    }),
    fragment: Object.freeze({
      get: (...args: Parameters<typeof state.fragment.get>) =>
        state.fragment.get(...args),
      delete: (...args: Parameters<typeof transforms.deleteFragment>) =>
        runSelectionMutation(() => transforms.deleteFragment(...args)),
      insert: (fragment, options) =>
        runMutation(options, () =>
          transforms.insertFragment(fragment, options)
        ),
    }),
    marks: Object.freeze({
      ...state.marks,
      add: (key: string, value: unknown) =>
        runSelectionMutation(() => transforms.addMark(key, value)),
      remove: (key: string) =>
        runSelectionMutation(() => transforms.removeMark(key)),
      toggle: (key: string, value = true) =>
        runSelectionMutation(() => transforms.toggleMark(key, value)),
    }),
    nodes: Object.freeze({
      ...state.nodes,
      insert: (nodes, options) =>
        runMutation(options, () => transforms.insertNodes(nodes, options)),
      lift: (options) =>
        runMutation(options, () => transforms.liftNodes(options)),
      merge: (options) =>
        runMutation(options, () => transforms.mergeNodes(options)),
      move: (options) =>
        runMutation(options, () => transforms.moveNodes(options)),
      remove: (options) =>
        runMutation(options, () => transforms.removeNodes(options)),
      set: (props, options) =>
        runMutation(options, () => transforms.setNodes(props, options)),
      split: (options) =>
        runMutation(options, () => transforms.splitNodes(options)),
      unset: (props, options) =>
        runMutation(options, () => transforms.unsetNodes(props, options)),
      unwrap: (options) =>
        runMutation(options, () => transforms.unwrapNodes(options)),
      wrap: (element, options) =>
        runMutation(options, () => transforms.wrapNodes(element, options)),
    }),
    normalize: (options = {}) => transforms.normalize(options),
    operations: Object.freeze({
      replay: (operations, options = {}) => {
        if (operations.length === 0) {
          return;
        }

        withUpdateTagContext(editor, normalizeUpdateTags(options.tag), () => {
          for (const operation of operations) {
            assertKnownReplayOperation(operation);
            const isInternalOwnedReplay =
              consumeInternalOwnedReplayOperation(operation);
            const replayOperation = isInternalOwnedReplay
              ? operation
              : operation.type === 'replace_children'
                ? profileCoreDuration(
                    'operation-replay-clone:replace_children',
                    () => cloneValue(operation)
                  )
                : cloneValue(operation);

            applyOperation(
              editor,
              withReplayOperationDefaultRoot(replayOperation)
            );
          }
        });
      },
    }),
    roots: Object.freeze({
      create: (root, children) => {
        requireMutableRoot(root);
        const roots = getEditorDocumentRoots(editor);

        if (Object.hasOwn(roots, root)) {
          throw new Error(`Cannot create existing editor root "${root}".`);
        }

        applyOperation(
          editor,
          createRootReplaceChildrenOperation(root, [], children, {
            rootIsPresent: true,
            rootWasPresent: false,
          })
        );
      },
      delete: (root) => {
        requireMutableRoot(root);
        const roots = getEditorDocumentRoots(editor);
        const children = roots[root];

        if (!Object.hasOwn(roots, root) || children === undefined) {
          throw new Error(`Cannot delete missing editor root "${root}".`);
        }

        applyOperation(
          editor,
          createRootReplaceChildrenOperation(root, children, [], {
            rootIsPresent: false,
            rootWasPresent: true,
          })
        );
      },
      replace: (root, children) => {
        requireMutableRoot(root);
        const roots = getEditorDocumentRoots(editor);
        const previousChildren = roots[root];

        if (!Object.hasOwn(roots, root) || previousChildren === undefined) {
          throw new Error(`Cannot replace missing editor root "${root}".`);
        }

        applyOperation(
          editor,
          createRootReplaceChildrenOperation(root, previousChildren, children, {
            rootIsPresent: true,
            rootWasPresent: true,
          })
        );
      },
    }),
    statePatches: Object.freeze({
      replay: (statePatches) => applyStatePatches(editor, statePatches, 'redo'),
    }),
    selection: Object.freeze({
      ...state.selection,
      clear: () => runSelectionMutation(() => transforms.deselect()),
      collapse: (options = {}) =>
        runSelectionMutation(() => transforms.collapse(options)),
      move: (options = {}) =>
        runSelectionMutation(() => transforms.move(options)),
      set: (target: Location | null) => {
        if (target == null) {
          runSelectionMutation(() => transforms.deselect());
          return;
        }

        runLocationMutation(target, () => transforms.select(target));
      },
      setPoint: (...args: Parameters<typeof transforms.setPoint>) =>
        runSelectionMutation(() => transforms.setPoint(...args)),
      setRange: (...args: Parameters<typeof transforms.setSelection>) =>
        runSelectionMutation(() => transforms.setSelection(...args)),
    }),
    setField: <TValue>(
      field: EditorStateField<TValue>,
      value: StateFieldValueInput<TValue>
    ) => setStateFieldValue(editor, field, value),
    text: Object.freeze({
      ...state.text,
      delete: (options = {}) =>
        runMutation(options, () => transforms.delete(options)),
      deleteBackward: (options = {}) =>
        runSelectionMutation(() =>
          transforms.deleteBackward(options.unit ?? 'character')
        ),
      deleteForward: (options = {}) =>
        runSelectionMutation(() =>
          transforms.deleteForward(options.unit ?? 'character')
        ),
      insert: (text: string, options = {}) =>
        runMutation(options, () => transforms.insertText(text, options)),
    }),
    value: Object.freeze({
      ...state.value,
      replace: (input: SnapshotInput<V>) => replaceSnapshot(editor, input),
    }),
    withoutNormalizing: (fn: () => void) => transforms.withoutNormalizing(fn),
  } satisfies EditorCoreUpdateTransaction<V>;

  const txRecord = tx as unknown as Record<string, unknown>;

  for (const [groupName, registration] of getExtensionRegistry(editor)
    .txGroups) {
    txRecord[groupName] = registration.factory(
      txRecord as never,
      editor as never
    );
  }

  return Object.freeze(txRecord) as EditorUpdateTransaction<V, TExtensions>;
};

export const getActiveUpdateView = <
  V extends Value,
  TExtensions extends readonly unknown[] = readonly [],
>(
  editor: Editor<V, TExtensions>
): EditorUpdateTransaction<V, TExtensions> => {
  if (!isInTransaction(editor)) {
    throw new Error(
      'transform middleware tx is only available during editor.update'
    );
  }

  return getUpdateView(editor);
};

export const getNormalizerUpdateView = <V extends Value>(
  editor: Editor<V>
): EditorNormalizerTransaction<V> => {
  const tx = getUpdateView(editor);

  return Object.freeze({
    break: tx.break,
    fragment: tx.fragment,
    marks: tx.marks,
    nodes: tx.nodes,
    selection: tx.selection,
    text: tx.text,
    value: Object.freeze({
      get: tx.value.get,
    }),
  } satisfies EditorNormalizerTransaction<V>);
};

const getFragment = <V extends Value>(
  editor: Editor<V>,
  options: EditorFragmentReadOptions = {}
): Descendant[] => {
  const range = options.at ?? getCurrentSelection(editor);

  if (range == null) {
    return [];
  }

  return NodeApi.fragment(editor, range);
};

export const readEditor = <
  V extends Value,
  TExtensions extends readonly unknown[] = readonly [],
  T = unknown,
>(
  editor: Editor<V, TExtensions>,
  fn: (state: EditorStateView<V, TExtensions>) => T
): T => {
  const exitRead = enterEditorRead(editor);

  try {
    return fn(getStateView(editor));
  } finally {
    exitRead();
  }
};

export const updateEditor = <
  V extends Value,
  TExtensions extends readonly unknown[] = readonly [],
>(
  editor: Editor<V, TExtensions>,
  fn: (
    transaction: EditorUpdateTransaction<V, TExtensions>,
    context: EditorUpdateContext<Editor<V, TExtensions>>
  ) => void,
  options: EditorUpdateOptions = {}
) => {
  if (isExecutingQueryMiddleware(editor)) {
    throw new Error('editor.update cannot be started inside query middleware');
  }

  if (getEditorReadDepth(editor) > 0 && !isInTransaction(editor)) {
    throw new Error(
      'editor.update cannot be started inside editor.read outside an active update'
    );
  }

  const tags = normalizeUpdateTags(options.tag);
  const metadata = cloneUpdateMetadata(options.metadata);
  const root = getActiveOperationRoot(editor);
  const run = () =>
    runEditorTransaction(
      editor,
      () => fn(getUpdateView(editor), getUpdateContext(editor)),
      {
        authority: 'update',
        metadata,
        skipNormalize: options.skipNormalize,
      }
    );

  return withUpdateTagContext(editor, tags, () =>
    root
      ? withEditorOperationRoot(editor, root, () =>
          withEditorOperationRootChildren(editor, root, run)
        )
      : run()
  );
};

export const withEditorRootChildren = <T>(
  editor: Editor,
  root: string,
  fn: () => T
): T => {
  const restoreRootChildren = enterEditorRootChildren(editor, root);

  if (!restoreRootChildren) {
    return fn();
  }

  try {
    return fn();
  } finally {
    restoreRootChildren();
  }
};

export const withEditorRootChildrenGenerator = <T>(
  editor: Editor,
  root: string | null | undefined,
  create: () => Iterable<T>
): Generator<T, void, undefined> =>
  (function* editorRootChildrenGenerator() {
    const createIterator = () => {
      const restoreRootChildren = enterEditorRootChildren(editor, root);

      try {
        return create()[Symbol.iterator]();
      } finally {
        restoreRootChildren?.();
      }
    };
    const iterator = createIterator();
    let done = false;

    try {
      while (true) {
        const restoreRootChildren = enterEditorRootChildren(editor, root);
        let result: IteratorResult<T>;

        try {
          result = iterator.next();
        } finally {
          restoreRootChildren?.();
        }

        if (result.done) {
          done = true;
          return;
        }

        yield result.value;
      }
    } finally {
      if (!done) {
        const restoreRootChildren = enterEditorRootChildren(editor, root);

        try {
          iterator.return?.();
        } finally {
          restoreRootChildren?.();
        }
      }
    }
  })();

const enterEditorRootChildren = (
  editor: Editor,
  root: string | null | undefined
): (() => void) | undefined => {
  const targetRoot = root ?? MAIN_ROOT_KEY;
  const previousActiveChildrenRoot = ACTIVE_CHILDREN_ROOT.get(editor);
  const previousRoot = getCurrentChildrenRoot(editor);
  const previousChildren = getChildren(editor) as Descendant[];
  const previousRoots = getEditorDocumentRoots(editor);
  const previousRootChildren = previousRoots[previousRoot];

  if (
    previousRoot === targetRoot &&
    previousRootChildren === previousChildren
  ) {
    return;
  }

  const hadTargetRoot = Object.hasOwn(previousRoots, targetRoot);
  const rootChildren = previousRoots[targetRoot] ?? [];

  ROOTS.set(editor, previousRoots);
  CHILDREN.set(editor, rootChildren);
  ACTIVE_CHILDREN_ROOT.set(editor, targetRoot);
  CURRENT_CHILDREN_ROOT.set(editor, targetRoot);
  clearLiveRuntimeIndexCache(editor);
  SNAPSHOT_CACHE.delete(editor);

  return () => {
    const currentRoots = ROOTS.get(editor) ?? previousRoots;
    const nextRoots =
      hadTargetRoot || Object.hasOwn(currentRoots, targetRoot)
        ? getEditorDocumentRoots(editor)
        : previousRoots;
    const restoreRoot = previousRoot;
    const restoredChildren = nextRoots[restoreRoot] ?? [];

    CHILDREN.set(editor, restoredChildren);
    ROOTS.set(editor, nextRoots);
    CURRENT_CHILDREN_ROOT.set(editor, previousRoot);
    if (previousActiveChildrenRoot === undefined) {
      ACTIVE_CHILDREN_ROOT.delete(editor);
    } else {
      ACTIVE_CHILDREN_ROOT.set(editor, previousActiveChildrenRoot);
    }
    clearLiveRuntimeIndexCache(editor);
    SNAPSHOT_CACHE.delete(editor);
  };
};

export const withEditorOperationRootChildren = <T>(
  editor: Editor,
  root: string | null | undefined,
  fn: () => T
): T => {
  const restoreRootChildren = enterEditorRootChildren(editor, root);

  if (!restoreRootChildren) {
    return fn();
  }

  try {
    return fn();
  } finally {
    restoreRootChildren();
  }
};

export const withOperationRootChildren = <T>(
  editor: Editor,
  operation: Operation,
  fn: () => T
): T => {
  const root = getOperationRoot(operation);

  return root
    ? withEditorOperationRoot(editor, root, () =>
        withEditorOperationRootChildren(editor, root, fn)
      )
    : fn();
};

export const setChildren = (
  editor: Editor,
  children: Descendant[],
  options: { invalidateRuntimeIndex?: boolean } = {}
) => {
  const root = getCurrentChildrenRoot(editor);

  CHILDREN.set(editor, children);
  ROOTS.set(editor, {
    ...(ROOTS.get(editor) ?? {}),
    [root]: children,
  });
  bumpMutationVersion(editor);
  if (options.invalidateRuntimeIndex) {
    bumpRuntimeIndexVersion(editor);
  }
  SNAPSHOT_CACHE.delete(editor);
  markTransactionChanged(editor);
};

export const deleteEditorRoot = (
  editor: Editor,
  root: string | null | undefined
) => {
  const targetRoot = root ?? MAIN_ROOT_KEY;

  if (targetRoot === MAIN_ROOT_KEY) {
    return;
  }

  const currentRoots = getEditorDocumentRoots(editor);

  if (!Object.hasOwn(currentRoots, targetRoot)) {
    return;
  }

  const nextRoots = { ...currentRoots };
  delete nextRoots[targetRoot];

  ROOTS.set(editor, nextRoots);
  if (getCurrentChildrenRoot(editor) === targetRoot) {
    CHILDREN.set(editor, []);
  }
  bumpMutationVersion(editor);
  bumpRuntimeIndexVersion(editor);
  SNAPSHOT_CACHE.delete(editor);
  markTransactionChanged(editor);
};

export const getCurrentMarks = (editor: Editor): EditorMarks | null =>
  getSelectionStateMarks(editor);

export const setCurrentMarks = (editor: Editor, marks: EditorMarks | null) => {
  setSelectionStateMarks(editor, marks);
  bumpMutationVersion(editor);
  SNAPSHOT_CACHE.delete(editor);
  markTransactionChanged(editor);
};

export const getCurrentSelection = (editor: Editor): Selection =>
  getSelectionStateSelection(editor);

export const getCurrentSelectionRoot = (editor: Editor): string =>
  getSelectionStateRoot(editor);

export const getPublicSelection = (editor: Editor): Selection =>
  getCurrentSelection(editor);

export const setCurrentSelection = (
  editor: Editor,
  selection: Selection,
  root = getActiveOperationRoot(editor) ?? getCurrentSelectionRoot(editor)
) => {
  setSelectionStateSelection(editor, selection, root);
  bumpMutationVersion(editor);
  SNAPSHOT_CACHE.delete(editor);
  markTransactionChanged(editor);
};

export const syncImplicitTargetToCurrentSelection = (editor: Editor) => {
  const snapshot = TRANSACTION_SNAPSHOT.get(editor);

  if (!snapshot) {
    return;
  }

  snapshot.implicitTarget = cloneValue(getCurrentSelection(editor));
  snapshot.implicitTargetResolved = true;
};

export const transformImplicitTarget = (
  editor: Editor,
  operation: Operation
) => {
  const snapshot = TRANSACTION_SNAPSHOT.get(editor);

  if (!snapshot?.implicitTargetResolved || !snapshot.implicitTarget) {
    return;
  }

  snapshot.implicitTarget = RangeApi.transform(
    snapshot.implicitTarget,
    operation
  );
};

export const resolveImplicitTarget = (
  editor: Editor,
  fallback: Selection
): Selection =>
  resolveTargetRuntimeImplicitTarget(editor, fallback, (target) => {
    setCurrentSelection(editor, target);
  });

export const getOperations = (
  editor: Editor,
  startIndex?: number
): readonly Operation[] =>
  getOperationStateOperations(editor, {
    inTransaction: isInTransaction(editor),
    startIndex,
  });

export const setOperations = (editor: Editor, operations: Operation[]) => {
  setOperationStateOperations(editor, operations);
};

export const appendOperation = (editor: Editor, operation: Operation) => {
  appendOperationStateOperation(editor, operation);
  if (operationInvalidatesRuntimeIndex(operation)) {
    bumpRuntimeIndexVersion(editor);
  }
  if (!isInTransaction(editor)) {
    clearPublicOperationStateCache(editor);
  }
};

export const setBaseApply = (
  editor: Editor,
  apply: (operation: Operation) => void
) => {
  setBaseApplyState(editor, apply);
};

const applyWithOperationMiddlewares = (
  editor: Editor,
  operation: Operation
) => {
  const applyRootDefaults = (nextOperation: Operation) =>
    withRootLifecycleDefaults(
      withDefaultOperationRoot(nextOperation, getActiveOperationRoot(editor)),
      (root) => Object.hasOwn(getEditorDocumentRoots(editor), root)
    );
  const initialOperation = applyRootDefaults(operation);
  const baseApply = getBaseApplyState(editor);

  if (!baseApply) {
    throw new Error('Editor operation applier has not been initialized.');
  }

  const middlewares = [...getExtensionRegistry(editor).operationMiddlewares];
  let index = -1;

  const dispatch = (nextOperation: Operation = initialOperation) => {
    index += 1;
    const rootedOperation = applyRootDefaults(nextOperation);
    const middleware = middlewares[index];

    if (!middleware) {
      profileCoreDuration(`apply-${rootedOperation.type}`, () =>
        baseApply(rootedOperation)
      );
      return;
    }

    middleware({ editor, operation: rootedOperation }, dispatch);
  };

  dispatch(initialOperation);
};

export const applyOperation = (editor: Editor, operation: Operation) => {
  const writer = TRANSACTION_APPLY.get(editor);

  if (writer) {
    writer(operation);
    return;
  }

  assertCanStartEditorWrite(editor);
  runEditorTransaction(editor, (transaction) => {
    transaction.apply(operation);
  });
};

export const getLatestOperation = (editor: Editor) =>
  getLiveOperations(editor).at(-1);

export const getLatestContentOperation = (
  editor: Editor,
  startIndex: number
): Operation | undefined =>
  getLiveOperations(editor)
    .slice(startIndex)
    .findLast((operation) => operation.type !== 'set_selection');

export const getOperationCount = (editor: Editor) =>
  getLiveOperations(editor).length;

export const hasInternalEditorState = (value: unknown): value is Editor =>
  typeof value === 'object' &&
  value !== null &&
  CHILDREN.has(value as Editor) &&
  hasOperationState(value as Editor);

const getTransactionView = (editor: Editor): EditorTransaction => {
  const existing = TRANSACTION_VIEW.get(editor);

  if (existing) {
    return existing;
  }

  const transaction = Object.freeze({
    apply(operation: Operation) {
      applyWithOperationMiddlewares(editor, operation);
    },
    get children() {
      return getChildren(editor);
    },
    getModelSelection() {
      return getCurrentSelection(editor);
    },
    get marks() {
      return getCurrentMarks(editor);
    },
    get operations() {
      return Object.freeze(cloneValue(getLiveOperations(editor)));
    },
    resolveTarget(options: { at?: Location } = {}) {
      if (options.at !== undefined) {
        return options.at;
      }

      return profileCoreDuration('transaction-resolve-target', () => {
        const snapshot = TRANSACTION_SNAPSHOT.get(editor);

        if (snapshot?.implicitTargetResolved) {
          return cloneValue(snapshot.implicitTarget);
        }

        const target = profileCoreDuration('resolve-implicit-target', () =>
          resolveImplicitTarget(editor, getCurrentSelection(editor))
        );

        if (snapshot) {
          snapshot.implicitTarget = cloneValue(target);
          snapshot.implicitTargetResolved = true;
        }

        return target;
      });
    },
    get selection() {
      return getCurrentSelection(editor);
    },
    setMarks(marks: EditorMarks | null) {
      setCurrentMarks(editor, marks);
    },
    setSelection(selection: Selection) {
      const currentSelection = getCurrentSelection(editor);
      const operation = createSetSelectionOperation(
        currentSelection,
        selection
      );

      if (!operation) {
        return;
      }

      applyWithOperationMiddlewares(editor, operation);
    },
  }) as unknown as EditorTransaction;

  TRANSACTION_VIEW.set(editor, transaction);

  return transaction;
};

export const getSnapshot = (editor: Editor): EditorSnapshot => {
  const cached = SNAPSHOT_CACHE.get(editor);

  if (cached) {
    return cached;
  }

  const liveChildren = getChildren(editor);
  const children = cloneFrozen(liveChildren);
  const selection = cloneFrozen(getCurrentSelection(editor));
  const marks = cloneFrozen(getCurrentMarks(editor));

  const snapshot = Object.freeze({
    children,
    index: buildSnapshotIndex(editor, liveChildren),
    marks,
    selection,
    version: getVersion(editor),
  }) as unknown as EditorSnapshot;

  SNAPSHOT_CACHE.set(editor, snapshot);

  return snapshot;
};

const getSelectionOnlySnapshot = (
  editor: Editor,
  previousSnapshot: EditorSnapshot
): EditorSnapshot =>
  Object.freeze({
    children: previousSnapshot.children,
    index: previousSnapshot.index,
    marks: cloneFrozen(getCurrentMarks(editor)),
    selection: cloneFrozen(getCurrentSelection(editor)),
    version: getVersion(editor),
  }) as unknown as EditorSnapshot;

const canBuildPathStableSnapshot = (
  operations: readonly Operation[],
  root: string
) =>
  operations.length > 0 &&
  operations.every(
    (operation) =>
      (operation.type === 'insert_text' ||
        operation.type === 'remove_text' ||
        operation.type === 'set_selection') &&
      getOperationRoot(operation) === root
  );

const getHomogeneousOperationRoot = (
  operations: readonly Operation[]
): string | null | undefined => {
  if (operations.length === 0) {
    return;
  }

  const roots = new Set(operations.map(getOperationRoot));

  return roots.size === 1 ? roots.values().next().value : null;
};

const getRootScopedSelection = (
  selection: Selection,
  selectionRoot: string,
  root: string
): Selection => (selectionRoot === root ? cloneFrozen(selection) : null);

const getRootScopedMarks = (
  marks: EditorMarks | null,
  selectionRoot: string,
  root: string
): EditorMarks | null => (selectionRoot === root ? cloneFrozen(marks) : null);

const getCurrentRootIndex = (editor: Editor, root: string): SnapshotIndex =>
  buildSnapshotIndex(editor, getEditorDocumentRoots(editor)[root] ?? []);

const getTransactionSnapshotIndex = (
  editor: Editor,
  transactionSnapshot: TransactionSnapshot,
  root: string
): RuntimeIndexLike => {
  const existingIndex =
    transactionSnapshot.rootIndexes[root] ??
    (root === transactionSnapshot.childrenRoot
      ? transactionSnapshot.previousIndex
      : null);

  if (existingIndex) {
    return existingIndex;
  }

  const index = buildSnapshotIndex(
    editor,
    transactionSnapshot.roots[root] ?? []
  );

  transactionSnapshot.rootIndexes[root] = index;

  return index;
};

const getTransactionRootSnapshot = (
  editor: Editor,
  transactionSnapshot: TransactionSnapshot,
  root: string
): EditorSnapshot => {
  const children = transactionSnapshot.roots[root] ?? [];
  const runtimeIndex = getTransactionSnapshotIndex(
    editor,
    transactionSnapshot,
    root
  );
  const index =
    runtimeIndex.pathToId instanceof Map
      ? buildSnapshotIndex(editor, children)
      : runtimeIndex;

  return Object.freeze({
    children: cloneFrozen(children),
    index,
    marks: getRootScopedMarks(
      transactionSnapshot.marks,
      transactionSnapshot.selectionRoot,
      root
    ),
    selection: getRootScopedSelection(
      transactionSnapshot.selection,
      transactionSnapshot.selectionRoot,
      root
    ),
    version: transactionSnapshot.previousVersion,
  }) as unknown as EditorSnapshot;
};

const getCurrentRootSnapshot = (
  editor: Editor,
  root: string
): EditorSnapshot => {
  const liveChildren = getEditorDocumentRoots(editor)[root] ?? [];
  const selectionRoot = getCurrentSelectionRoot(editor);
  const children = profileCoreDuration('snapshot-clone-children', () =>
    cloneFrozen(liveChildren)
  );
  const index =
    root === MAIN_ROOT_KEY
      ? profileCoreDuration('snapshot-build-index', () => {
          const { liveIndex, snapshotIndex } =
            buildSnapshotIndexWithLiveRuntimeIndex(editor, liveChildren);

          setLiveRuntimeIndexCache(editor, liveIndex);

          return snapshotIndex;
        })
      : profileCoreDuration('snapshot-build-index', () =>
          buildSnapshotIndex(editor, liveChildren)
        );

  return Object.freeze({
    children,
    index,
    marks: getRootScopedMarks(getCurrentMarks(editor), selectionRoot, root),
    selection: getRootScopedSelection(
      getCurrentSelection(editor),
      selectionRoot,
      root
    ),
    version: getVersion(editor),
  }) as unknown as EditorSnapshot;
};

const getListenerSnapshot = (
  editor: Editor,
  _change?: EditorCommit
): EditorSnapshot =>
  withEditorRootChildren(editor, MAIN_ROOT_KEY, () => getSnapshot(editor));

const withUnknownRuntimeImpact = (change: EditorCommit): EditorCommit =>
  Object.freeze({
    ...change,
    affectedNodeRuntimeIds: null,
    affectedProjectionRuntimeIds: null,
    affectedSelectionRuntimeIds: null,
    affectedTextRuntimeIds: null,
    dirty: buildDirtyRegion({
      dirtyPaths: [],
      dirtyScope: 'all',
      touchedRuntimeIds: null,
    }),
    dirtyElementRuntimeIds: null,
    dirtyPaths: [],
    dirtyScope: 'all',
    dirtyTextRuntimeIds: null,
    dirtyTopLevelRanges: null,
    dirtyTopLevelRuntimeIds: null,
    fullDocumentChanged: true,
    nodeImpactRuntimeIds: null,
    rootRuntimeIdsChanged: true,
    structuralDirtyRuntimeIds: null,
    textDirtyRuntimeIds: null,
    topLevelOrderChanged: true,
    touchedRuntimeIds: null,
  });

const withTransactionViewState = (
  editor: Editor,
  transactionSnapshot: TransactionSnapshot,
  change: EditorCommit
): EditorCommit => {
  const marksBefore = cloneValue(transactionSnapshot.marks);
  const marksAfter = cloneValue(getCurrentMarks(editor));
  const selectionBefore = cloneValue(transactionSnapshot.selection);
  const selectionAfter = cloneValue(getCurrentSelection(editor));
  const marksChanged =
    change.classes[0] === 'mark' ||
    !areSerializableValuesEqual(marksBefore ?? null, marksAfter ?? null);
  const selectionChanged =
    change.operations.some((operation) => operation.type === 'set_selection') ||
    !areSerializableValuesEqual(
      selectionBefore ?? null,
      selectionAfter ?? null
    );
  const selectionRootChanged =
    transactionSnapshot.selectionRoot !== getCurrentSelectionRoot(editor);
  const selectionImpactRuntimeIds =
    selectionChanged && selectionRootChanged
      ? null
      : change.selectionImpactRuntimeIds;

  return Object.freeze({
    ...change,
    affectedSelectionRuntimeIds: selectionImpactRuntimeIds,
    marksAfter,
    marksBefore,
    marksChanged,
    selectionAfter,
    selectionBefore,
    selectionChanged,
    selectionImpactRuntimeIds,
    snapshotChanged:
      change.childrenChanged ||
      marksChanged ||
      selectionChanged ||
      change.statePatches.length > 0,
  });
};

type TextSnapshotOperation = Extract<
  Operation,
  { type: 'insert_text' | 'remove_text' }
>;

type TextSnapshotPatch = {
  operations: TextSnapshotOperation[];
  path: Path;
};

const applyTextSnapshotOperations = (
  text: string,
  operations: readonly TextSnapshotOperation[]
) =>
  operations.reduce((currentText, operation) => {
    const before = currentText.slice(0, operation.offset);

    if (operation.type === 'insert_text') {
      return before + operation.text + currentText.slice(operation.offset);
    }

    return before + currentText.slice(operation.offset + operation.text.length);
  }, text);

const buildTextSnapshotPatches = (
  operations: readonly Operation[]
): TextSnapshotPatch[] => {
  const patches = new Map<string, TextSnapshotPatch>();

  for (const operation of operations) {
    if (
      (operation.type !== 'insert_text' && operation.type !== 'remove_text') ||
      operation.text.length === 0
    ) {
      continue;
    }

    const key = pathKey(operation.path);
    const patch = patches.get(key);

    if (patch) {
      patch.operations.push(operation);
      continue;
    }

    patches.set(key, {
      operations: [operation],
      path: operation.path,
    });
  }

  return [...patches.values()];
};

const updateTextPatchesInSnapshotChildren = (
  children: readonly Descendant[],
  patches: readonly TextSnapshotPatch[],
  depth = 0
): readonly Descendant[] | null => {
  if (patches.length === 0) {
    return children;
  }

  const patchesByIndex = new Map<number, TextSnapshotPatch[]>();

  for (const patch of patches) {
    const index = patch.path[depth];

    if (index == null) {
      return null;
    }

    const bucket = patchesByIndex.get(index) ?? [];
    bucket.push(patch);
    patchesByIndex.set(index, bucket);
  }

  const nextChildren = [...children];

  for (const [index, indexPatches] of patchesByIndex) {
    const node = children[index];

    if (!node) {
      return null;
    }

    const textPatches = indexPatches.filter(
      (patch) => depth === patch.path.length - 1
    );
    const childPatches = indexPatches.filter(
      (patch) => depth < patch.path.length - 1
    );

    if (textPatches.length > 0) {
      if (!NodeApi.isText(node) || childPatches.length > 0) {
        return null;
      }

      nextChildren[index] = Object.freeze({
        ...node,
        text: applyTextSnapshotOperations(
          node.text,
          textPatches.flatMap((patch) => patch.operations)
        ),
      }) as Descendant;

      continue;
    }

    if (!('children' in node) || !Array.isArray(node.children)) {
      return null;
    }

    const updatedDescendants = updateTextPatchesInSnapshotChildren(
      node.children,
      childPatches,
      depth + 1
    );

    if (!updatedDescendants) {
      return null;
    }

    nextChildren[index] =
      updatedDescendants === node.children
        ? node
        : (Object.freeze({
            ...node,
            children: updatedDescendants as Descendant[],
          }) as Descendant);
  }

  return Object.freeze(nextChildren);
};

const getPathStableSnapshot = (
  editor: Editor,
  previousSnapshot: EditorSnapshot,
  operations: readonly Operation[],
  root: string
): EditorSnapshot | null => {
  if (!canBuildPathStableSnapshot(operations, root)) {
    return null;
  }

  const children = updateTextPatchesInSnapshotChildren(
    previousSnapshot.children as readonly Descendant[],
    buildTextSnapshotPatches(operations)
  );

  if (!children) {
    return null;
  }

  const snapshot = Object.freeze({
    children,
    index: previousSnapshot.index,
    marks: getRootScopedMarks(
      getCurrentMarks(editor),
      getCurrentSelectionRoot(editor),
      root
    ),
    selection: getRootScopedSelection(
      getCurrentSelection(editor),
      getCurrentSelectionRoot(editor),
      root
    ),
    version: getVersion(editor),
  }) as unknown as EditorSnapshot;

  return snapshot;
};

const buildSparseRuntimeIndexForPaths = (
  editor: Editor,
  paths: readonly Path[],
  root = MAIN_ROOT_KEY
): SnapshotIndex => {
  const idToPath = {} as Record<RuntimeId, Path>;
  const pathToId = {} as Record<string, RuntimeId>;

  for (const path of paths) {
    if (path.length === 0) {
      continue;
    }

    const runtimeId = getLiveRuntimeIdAtRootPath(editor, root, path);

    if (!runtimeId) {
      continue;
    }

    idToPath[runtimeId] = path;
    pathToId[pathKey(path)] = runtimeId;
  }

  return {
    idToPath: Object.freeze(idToPath),
    pathToId: Object.freeze(pathToId),
  };
};

const getOperationNodeRuntimeIds = (
  editor: Editor,
  node: unknown
): RuntimeId[] => {
  if (!node || typeof node !== 'object') {
    return [];
  }

  const descendant = node as Descendant;
  const runtimeIds = [getOrCreateRuntimeId(descendant, editor)];

  if ('children' in descendant && Array.isArray(descendant.children)) {
    runtimeIds.push(
      ...descendant.children.flatMap((child) =>
        getOperationNodeRuntimeIds(editor, child)
      )
    );
  }

  return runtimeIds;
};

const getLiveSubtreeRuntimeIdsAtPath = (
  editor: Editor,
  path: Path
): RuntimeId[] => {
  const node = getLiveNode(editor, path);

  return getOperationNodeRuntimeIds(editor, node);
};

const getTopLevelOrderTouchedRuntimeIds = (
  editor: Editor,
  operations: readonly Operation[]
): RuntimeId[] =>
  uniqRuntimeIds(
    operations.flatMap((operation) => {
      switch (operation.type) {
        case 'insert_node':
        case 'remove_node':
          return getOperationNodeRuntimeIds(editor, operation.node);
        case 'move_node':
          return [
            ...getLiveSubtreeRuntimeIdsAtPath(editor, operation.newPath),
            ...(operation.newPath.length > 1
              ? getLiveSubtreeRuntimeIdsAtPath(
                  editor,
                  operation.newPath.slice(0, -1) as Path
                )
              : []),
          ];
        case 'replace_children':
          return [
            ...operation.children.flatMap((node) =>
              getOperationNodeRuntimeIds(editor, node)
            ),
            ...operation.newChildren.flatMap((node) =>
              getOperationNodeRuntimeIds(editor, node)
            ),
          ];
        case 'merge_node':
        case 'split_node':
          return getLiveSubtreeRuntimeIdsAtPath(editor, operation.path);
        default:
          return [];
      }
    })
  );

export const buildSnapshotChange = ({
  command = null,
  metadata = {},
  nextSnapshot,
  operations,
  previousSnapshot,
  reason,
  statePatches = [],
  tags = [],
}: {
  command?: EditorCommitCommand | null;
  metadata?: EditorUpdateMetadata;
  nextSnapshot: EditorSnapshot;
  operations: Operation[];
  previousSnapshot: EditorSnapshot;
  reason: 'replace' | null;
  statePatches?: readonly EditorStatePatch[];
  tags?: readonly EditorUpdateTag[];
}): EditorCommit => {
  const hasTextOperation = profileCoreDuration(
    'build-snapshot-change:classify-text',
    () =>
      operations.some(
        (op) => op.type === 'insert_text' || op.type === 'remove_text'
      )
  );
  const hasReplaceFragmentOperation = profileCoreDuration(
    'build-snapshot-change:classify-fragment',
    () => operations.some((op) => op.type === 'replace_fragment')
  );
  const hasStructuralTextOperation = profileCoreDuration(
    'build-snapshot-change:classify-structural-text',
    () => operations.some(operationChangesTextContent)
  );
  const classes = profileCoreDuration('build-snapshot-change:classes', () =>
    reason === 'replace' || hasReplaceFragmentOperation
      ? (['replace'] as const)
      : operations.length > 0 &&
          operations.every((op) => op.type === 'set_selection')
        ? (['selection'] as const)
        : hasTextOperation &&
            operations.every(
              (op) =>
                op.type === 'insert_text' ||
                op.type === 'remove_text' ||
                op.type === 'set_selection'
            )
          ? (['text'] as const)
          : operations.length > 0
            ? hasStructuralTextOperation
              ? (['structural', 'text'] as const)
              : (['structural'] as const)
            : statePatches.length > 0
              ? (['state'] as const)
              : (['mark'] as const)
  );

  const marksChanged = profileCoreDuration(
    'build-snapshot-change:marks-changed',
    () =>
      JSON.stringify(previousSnapshot.marks) !==
      JSON.stringify(nextSnapshot.marks)
  );
  const selectionChanged = profileCoreDuration(
    'build-snapshot-change:selection-changed',
    () =>
      JSON.stringify(previousSnapshot.selection) !==
      JSON.stringify(nextSnapshot.selection)
  );
  const selectionImpactRuntimeIds =
    classes[0] === 'replace'
      ? null
      : profileCoreDuration('build-snapshot-change:selection-impact', () =>
          getSelectionImpactRuntimeIds({
            nextIndex: nextSnapshot.index,
            previousIndex: previousSnapshot.index,
            selectionAfter: nextSnapshot.selection,
            selectionBefore: previousSnapshot.selection,
          })
        );

  const childrenChanged =
    classes[0] === 'replace' ||
    classes[0] === 'text' ||
    classes[0] === 'structural';

  const dirtyPaths = profileCoreDuration(
    'build-snapshot-change:dirty-paths',
    () =>
      classes[0] === 'text'
        ? uniqPaths(
            operations.flatMap((op) =>
              'path' in op && Array.isArray(op.path)
                ? [[], op.path.slice(0, -1), op.path]
                : []
            )
          )
        : []
  );

  const touchedRuntimeIds = profileCoreDuration(
    'build-snapshot-change:touched-runtime-ids',
    () =>
      classes[0] === 'replace'
        ? null
        : classes[0] === 'selection' || classes[0] === 'mark'
          ? []
          : uniqPaths(
              operations.flatMap((op) =>
                'path' in op && Array.isArray(op.path) ? [op.path] : []
              )
            ).map(
              (path) =>
                previousSnapshot.index.pathToId[pathKey(path)] ??
                nextSnapshot.index.pathToId[pathKey(path)]
            )
  );
  const decorationImpactRuntimeIds = profileCoreDuration(
    'build-snapshot-change:decoration-impact',
    () =>
      getDecorationImpactRuntimeIds({
        classes,
        dirtyPaths,
        nextIndex: nextSnapshot.index,
        previousIndex: previousSnapshot.index,
        selectionImpactRuntimeIds,
        touchedRuntimeIds,
      })
  );
  const nodeImpactRuntimeIds = profileCoreDuration(
    'build-snapshot-change:node-impact',
    () =>
      getNodeImpactRuntimeIds({
        classes,
        dirtyPaths,
        nextIndex: nextSnapshot.index,
        operations,
        previousIndex: previousSnapshot.index,
        touchedRuntimeIds,
      })
  );
  const dirtyScope =
    classes[0] === 'replace'
      ? 'all'
      : classes[0] === 'selection' ||
          classes[0] === 'mark' ||
          classes[0] === 'state'
        ? 'none'
        : 'paths';

  const runtimeDirtiness = profileCoreDuration(
    'build-snapshot-change:runtime-dirtiness',
    () =>
      buildCommitRuntimeDirtiness({
        classes,
        decorationImpactRuntimeIds,
        dirtyPaths,
        dirtyScope,
        nextIndex: nextSnapshot.index,
        nodeImpactRuntimeIds,
        operations,
        previousIndex: previousSnapshot.index,
        selectionImpactRuntimeIds,
        touchedRuntimeIds,
      })
  );

  return profileCoreDuration('build-snapshot-change:complete-commit', () =>
    completeCommit(
      {
        ...runtimeDirtiness,
        childrenChanged,
        classes,
        command: cloneValue(command),
        decorationImpactRuntimeIds,
        dirtyPaths,
        dirtyScope,
        dirtyStateKeys: Object.freeze(statePatches.map((patch) => patch.key)),
        marksAfter: cloneValue(nextSnapshot.marks),
        marksBefore: cloneValue(previousSnapshot.marks),
        marksChanged,
        metadata: cloneUpdateMetadata(metadata),
        nodeImpactRuntimeIds,
        operations: freezePublicCommitOperations(operations),
        replaceEpoch: classes[0] === 'replace' ? 1 : 0,
        selectionAfter: cloneValue(nextSnapshot.selection),
        selectionBefore: cloneValue(previousSnapshot.selection),
        selectionChanged,
        selectionImpactRuntimeIds,
        statePatches: Object.freeze(cloneValue([...statePatches])),
        tags: Object.freeze([...tags]),
        touchedRuntimeIds:
          touchedRuntimeIds == null
            ? null
            : Object.freeze(touchedRuntimeIds.filter(Boolean) as RuntimeId[]),
      },
      {
        previousVersion: previousSnapshot.version,
        version: nextSnapshot.version,
      }
    )
  );
};

export const notifyListeners = (editor: Editor, change?: EditorCommit) => {
  const listeners = getSnapshotListeners(editor);
  const sourceListeners = getSourceListeners(editor);
  const extensionCommitListeners = change
    ? getExtensionRegistry(editor).commitListeners
    : null;
  const sourcesForChange =
    change && sourceListeners ? getSourcesForChange(change) : [];
  const hasSourceListenersForChange = sourcesForChange.some(
    (source) => (sourceListeners?.get(source)?.size ?? 0) > 0
  );
  const hasSnapshotListeners =
    (listeners && listeners.size > 0) || hasSourceListenersForChange;
  const extensionCommitListenersNeedSnapshot =
    extensionCommitListeners &&
    [...extensionCommitListeners].some((listener) => listener.length >= 2);

  let snapshot: EditorSnapshot | null = null;
  const getSnapshotForListeners = () => {
    snapshot ??= profileCoreDuration('listener-snapshot', () =>
      getListenerSnapshot(editor, change)
    );

    return snapshot;
  };

  if (change) {
    LAST_COMMIT.set(editor, change);

    profileCoreDuration('notify-extension-commit-listeners', () => {
      for (const listener of extensionCommitListeners ?? []) {
        if (listener.length >= 2) {
          listener(change, getSnapshotForListeners());
        } else {
          (listener as (commit: EditorCommit) => void)(change);
        }
      }
    });

    profileCoreDuration('notify-commit-listeners', () => {
      for (const listener of getCommitListeners(editor) ?? []) {
        listener(change);
      }
    });
  }

  if (hasSnapshotListeners || extensionCommitListenersNeedSnapshot) {
    if ((listeners?.size ?? 0) > 0 || extensionCommitListenersNeedSnapshot) {
      getSnapshotForListeners();
    }

    profileCoreDuration('notify-snapshot-listeners', () => {
      for (const listener of listeners ?? []) {
        listener(getSnapshotForListeners(), change);
      }
    });

    if (change && sourceListeners) {
      profileCoreDuration('notify-source-listeners', () => {
        for (const source of sourcesForChange) {
          const listenersForSource = sourceListeners.get(source);

          if (!listenersForSource || listenersForSource.size === 0) {
            continue;
          }

          profileCoreDuration(`notify-source-listeners:${source}`, () => {
            for (const listener of listenersForSource) {
              listener(getSnapshotForListeners(), change);
            }
          });
        }
      });
    }
  }
};

const materializeAfterCommitHandlers = (
  editor: Editor,
  commit: EditorCommit,
  handlers: readonly TransactionAfterCommitHandler[]
): MaterializedAfterCommitHandler[] => {
  const snapshots = new Map<string, EditorSnapshot>();

  return handlers.map(({ handler, root }) => {
    let snapshot = snapshots.get(root);

    if (!snapshot) {
      snapshot = getCurrentRootSnapshot(editor, root);
      snapshots.set(root, snapshot);
    }

    return {
      context: {
        commit,
        editor,
        snapshot,
      } as EditorCommitContext,
      handler,
    };
  });
};

const runAfterCommitHandlers = (
  handlers: readonly MaterializedAfterCommitHandler[]
) => {
  for (const { context, handler } of handlers) {
    handler(context);
  }
};

export const incrementVersion = (editor: Editor) => {
  setVersion(editor, getVersion(editor) + 1);
};

const canSkipDefaultTopLevelStructuralNormalize = (
  editor: Editor,
  operations: readonly Operation[],
  snapshot: TransactionSnapshot | undefined
) => {
  if (!snapshot || !canUseTextFastPath(editor) || operations.length === 0) {
    return false;
  }

  let topLevelRemovals = 0;

  for (const operation of operations) {
    if (operation.type === 'set_selection') {
      continue;
    }

    if (operation.type === 'set_node') {
      if (operation.path.length < 1) {
        return false;
      }
      continue;
    }

    if (operation.type === 'move_node') {
      if (operation.path.length !== 1 || operation.newPath.length !== 1) {
        return false;
      }
      continue;
    }

    if (operation.type === 'remove_node') {
      if (operation.path.length !== 1) {
        return false;
      }
      topLevelRemovals += 1;
      continue;
    }

    return false;
  }

  return snapshot.children.length - topLevelRemovals > 0;
};

const rollbackTransactionOperations = (
  editor: Editor,
  transactionSnapshot: TransactionSnapshot
) => {
  const operations = getLiveOperations(editor).slice(
    transactionSnapshot.operationStart
  );

  for (const operation of operations.toReversed()) {
    const inverse = OperationApi.inverse(operation);

    for (const ref of pathRefs(editor)) {
      PathRefApi.transform(ref, inverse);
    }
    for (const ref of pointRefs(editor)) {
      PointRefApi.transform(ref, inverse);
    }
    for (const ref of allRangeRefs(editor)) {
      RangeRefApi.transform(ref, inverse);
    }

    withOperationRootChildren(editor, inverse, () => {
      transformOperation(editor, inverse);
    });
  }
};

const restoreTransactionSnapshot = (
  editor: Editor,
  transactionSnapshot: TransactionSnapshot
) => {
  const restoreRootIndexes = Object.fromEntries(
    Object.entries(transactionSnapshot.roots).map(([root, children]) => [
      root,
      transactionSnapshot.rootIndexes[root] ??
        (root === transactionSnapshot.childrenRoot
          ? transactionSnapshot.previousIndex
          : null) ??
        buildSnapshotIndex(editor, children),
    ])
  ) as Record<string, RuntimeIndexLike>;
  const restoredRoots = cloneValue(transactionSnapshot.roots);
  const activeRoot = getCurrentChildrenRoot(editor);
  const restoredChildren: Descendant[] = Object.hasOwn(
    restoredRoots,
    activeRoot
  )
    ? (restoredRoots[activeRoot] ?? [])
    : activeRoot === transactionSnapshot.childrenRoot
      ? (cloneValue(transactionSnapshot.children) as Descendant[])
      : (restoredRoots[MAIN_ROOT_KEY] ?? []);

  const seedFromIndex = (
    children: readonly Descendant[],
    sourceIndex: RuntimeIndexLike,
    parentPath: Path = []
  ) => {
    children.forEach((child, childIndex) => {
      const path = [...parentPath, childIndex] as Path;
      const runtimeId =
        sourceIndex.pathToId instanceof Map
          ? sourceIndex.pathToId.get(pathKey(path))
          : sourceIndex.pathToId[pathKey(path)];

      if (runtimeId) {
        setRuntimeId(child, editor, runtimeId);
      } else {
        getOrCreateRuntimeId(child, editor);
      }

      if ('children' in child && Array.isArray(child.children)) {
        seedFromIndex(child.children, sourceIndex, path);
      }
    });
  };

  for (const [root, children] of Object.entries(restoredRoots)) {
    seedFromIndex(children, restoreRootIndexes[root]!);
  }
  CHILDREN.set(editor, restoredChildren);
  ROOTS.set(editor, restoredRoots);
  CURRENT_CHILDREN_ROOT.set(editor, activeRoot);
  bumpMutationVersion(editor);
  bumpRuntimeIndexVersion(editor);
  SNAPSHOT_CACHE.delete(editor);
  setCurrentSelection(
    editor,
    transactionSnapshot.selection,
    transactionSnapshot.selectionRoot
  );
  setCurrentMarks(editor, transactionSnapshot.marks);
  DOCUMENT_STATE.set(
    editor,
    transactionSnapshot.documentState
      ? cloneValue(transactionSnapshot.documentState)
      : undefined
  );
  setOperations(
    editor,
    getLiveOperations(editor).slice(0, transactionSnapshot.operationStart)
  );
};

export const runEditorTransaction = (
  editor: Editor,
  fn: (transaction: EditorTransaction) => void,
  options: {
    authority?: TransactionAuthority;
    metadata?: EditorUpdateMetadata;
    skipNormalize?: boolean;
  } = {}
) => {
  const depth = getEditorTransactionDepth(editor);
  const isOuter = depth === 0;

  if (isOuter) {
    assertCanStartEditorWrite(editor, options.authority);
  }

  if (isOuter) {
    const needsPreviousSnapshot = hasListeners(editor);
    const needsFullPreviousSnapshot = hasSnapshotListeners(editor);
    const childrenRoot = getCurrentChildrenRoot(editor);
    const previousSnapshot = needsPreviousSnapshot
      ? profileCoreDuration('transaction-previous-snapshot', () =>
          needsFullPreviousSnapshot ? getSnapshot(editor) : null
        )
      : null;
    const previousVersion = previousSnapshot?.version ?? getVersion(editor);
    const previousIndex =
      previousSnapshot?.index ??
      (needsPreviousSnapshot
        ? profileCoreDuration('transaction-previous-index', () =>
            getLiveRuntimeIndex(editor)
          )
        : null);
    const previousLiveIndex =
      previousSnapshot && childrenRoot === MAIN_ROOT_KEY
        ? (getCachedLiveRuntimeIndex(editor)?.index ?? null)
        : null;
    const roots = getEditorDocumentRoots(editor);
    const rootIndexes: Record<string, RuntimeIndexLike> = {};
    const transactionRoots = profileCoreDuration(
      'transaction-roots-snapshot',
      () => ({ ...roots })
    );
    const transactionChildren = profileCoreDuration(
      'transaction-children-clone',
      () =>
        previousSnapshot?.children ??
        transactionRoots[childrenRoot] ??
        getChildren(editor)
    );

    TRANSACTION_SNAPSHOT.set(editor, {
      afterCommitHandlers: [],
      children: transactionChildren,
      childrenRoot,
      command: profileCoreDuration('transaction-command', () =>
        cloneValue(getCommandContext(editor))
      ),
      documentState: cloneDocumentState(DOCUMENT_STATE.get(editor)),
      implicitTarget: null,
      implicitTargetResolved: false,
      marks: previousSnapshot?.marks ?? getCurrentMarks(editor),
      metadata: cloneUpdateMetadata(options.metadata),
      operationStart: getLiveOperations(editor).length,
      previousIndex,
      previousLiveIndex,
      previousSnapshot,
      previousVersion,
      reason: null,
      rootIndexes,
      roots: transactionRoots,
      selection: previousSnapshot?.selection ?? getCurrentSelection(editor),
      selectionRoot: getCurrentSelectionRoot(editor),
      statePatches: [],
      tags: new Set(getCurrentUpdateTags(editor)),
    });
    TRANSACTION_CHANGED.set(editor, false);
  } else if (options.metadata) {
    const transactionSnapshot = TRANSACTION_SNAPSHOT.get(editor);

    if (transactionSnapshot) {
      transactionSnapshot.metadata = mergeUpdateMetadata(
        transactionSnapshot.metadata,
        options.metadata
      );
    }
  }

  incrementEditorTransactionDepth(editor, depth);

  try {
    const transaction = getTransactionView(editor);
    TRANSACTION_APPLY.set(editor, transaction.apply);
    profileCoreDuration('transaction-callback', () => fn(transaction));

    const operations = getLiveOperations(editor);
    const snapshot = TRANSACTION_SNAPSHOT.get(editor);
    const operationsSinceSnapshot = operations.slice(
      snapshot?.operationStart ?? 0
    );
    const selectionOnlyTransaction =
      operationsSinceSnapshot.length > 0 &&
      operationsSinceSnapshot.every(
        (operation) => operation.type === 'set_selection'
      );

    if (
      isOuter &&
      (TRANSACTION_CHANGED.get(editor) ?? false) &&
      getEditorRuntime(editor).isNormalizing() &&
      !options.skipNormalize &&
      !canSkipDefaultTopLevelStructuralNormalize(
        editor,
        operationsSinceSnapshot,
        snapshot
      ) &&
      !selectionOnlyTransaction
    ) {
      const latestContentOperationByRoot = new Map<
        string,
        Operation | undefined
      >();

      for (const operation of operationsSinceSnapshot) {
        if (operation.type === 'set_selection') {
          continue;
        }

        latestContentOperationByRoot.set(
          getOperationRoot(operation) ?? MAIN_ROOT_KEY,
          operation
        );
      }

      if (
        latestContentOperationByRoot.size === 0 &&
        snapshot?.reason === 'replace'
      ) {
        latestContentOperationByRoot.set(
          snapshot.childrenRoot ?? MAIN_ROOT_KEY,
          undefined
        );
      }

      for (const root of latestContentOperationByRoot.keys()) {
        const operation = latestContentOperationByRoot.get(root);
        const normalize = () =>
          profileCoreDuration('transaction-normalize', () =>
            getEditorTransformRegistry(editor).normalize({
              explicit: false,
              force: getOperationCount(editor) === 0,
              operation,
            })
          );

        withEditorOperationRoot(editor, root, () =>
          withEditorOperationRootChildren(editor, root, normalize)
        );
      }
    }
  } catch (error) {
    if (isOuter) {
      const snapshot = TRANSACTION_SNAPSHOT.get(editor);

      if (snapshot) {
        rollbackTransactionOperations(editor, snapshot);
        restoreTransactionSnapshot(editor, snapshot);
      }
      resetRangeRefDrafts(editor);
      TRANSACTION_APPLY.delete(editor);
      TRANSACTION_SNAPSHOT.delete(editor);
      TRANSACTION_CHANGED.delete(editor);
    }
    throw error;
  } finally {
    decrementEditorTransactionDepth(editor);

    if (isOuter) {
      const snapshot = TRANSACTION_SNAPSHOT.get(editor);
      const changed =
        (TRANSACTION_CHANGED.get(editor) ?? false) &&
        hasTransactionNetChanges(editor, snapshot);

      TRANSACTION_APPLY.delete(editor);
      TRANSACTION_SNAPSHOT.delete(editor);
      TRANSACTION_CHANGED.delete(editor);

      if (changed) {
        profileCoreDuration('publish-range-refs', () =>
          publishRangeRefDrafts(editor)
        );
        clearPublicOperationStateCache(editor);
        profileCoreDuration('set-version', () =>
          setVersion(editor, getVersion(editor) + 1)
        );
        const operations = profileCoreDuration('copy-operations', () =>
          getLiveOperations(editor).slice(snapshot?.operationStart ?? 0)
        );
        const operationRoot = getHomogeneousOperationRoot(operations);
        const changeRoot =
          operationRoot === null
            ? null
            : (operationRoot ?? snapshot?.childrenRoot ?? MAIN_ROOT_KEY);
        const selectionOnlyOperations =
          operations.length > 0 &&
          operations.every((operation) => operation.type === 'set_selection');
        const previousVersion = snapshot?.previousVersion ?? getVersion(editor);
        const needsSnapshotChange =
          snapshot !== undefined &&
          snapshot !== null &&
          changeRoot !== null &&
          hasSnapshotListeners(editor) &&
          !selectionOnlyOperations;
        const change = profileCoreDuration('build-change', () => {
          const nextChange =
            operationRoot === null
              ? withUnknownRuntimeImpact(
                  getOperationDirtiness(editor, operations, {
                    command: snapshot?.command,
                    marksBefore: snapshot?.marks,
                    previousIndex: snapshot?.previousIndex ?? undefined,
                    previousVersion,
                    reason: snapshot?.reason ?? null,
                    selectionBefore: snapshot?.selection,
                    statePatches: snapshot?.statePatches,
                    metadata: snapshot?.metadata,
                    tags: snapshot ? [...snapshot.tags] : [],
                  })
                )
              : needsSnapshotChange
                ? (() => {
                    const previousSnapshotForChange =
                      snapshot.previousSnapshot &&
                      changeRoot === snapshot.childrenRoot
                        ? snapshot.previousSnapshot
                        : getTransactionRootSnapshot(
                            editor,
                            snapshot,
                            changeRoot!
                          );
                    const nextSnapshot = profileCoreDuration(
                      'next-snapshot',
                      () =>
                        getPathStableSnapshot(
                          editor,
                          previousSnapshotForChange,
                          operations,
                          changeRoot!
                        ) ??
                        (() => {
                          const selectionRoot = getCurrentSelectionRoot(editor);
                          const liveChildren =
                            getEditorDocumentRoots(editor)[changeRoot!] ?? [];

                          return getFullRootReplaceCachedSnapshot({
                            liveChildren,
                            marks: getRootScopedMarks(
                              getCurrentMarks(editor),
                              selectionRoot,
                              changeRoot!
                            ),
                            operations,
                            resolveOperationRoot: getOperationRoot,
                            root: changeRoot!,
                            selection: getRootScopedSelection(
                              getCurrentSelection(editor),
                              selectionRoot,
                              changeRoot!
                            ),
                            setMainRootRuntimeIndex: (index) => {
                              setLiveRuntimeIndexCache(editor, index);
                            },
                            version: getVersion(editor),
                          });
                        })() ??
                        getCurrentRootSnapshot(editor, changeRoot!)
                    );
                    const cachedRuntimeIndex =
                      changeRoot === MAIN_ROOT_KEY
                        ? getCachedLiveRuntimeIndex(editor)
                        : null;
                    const nextLiveIndex =
                      cachedRuntimeIndex?.version ===
                      getRuntimeIndexVersion(editor)
                        ? cachedRuntimeIndex.index
                        : null;

                    cacheFullRootReplaceSnapshotIndexes(
                      operations,
                      previousSnapshotForChange,
                      snapshot.previousLiveIndex,
                      nextSnapshot,
                      nextLiveIndex,
                      changeRoot!,
                      getOperationRoot
                    );

                    if (changeRoot === snapshot.childrenRoot) {
                      SNAPSHOT_CACHE.set(editor, nextSnapshot);
                    }

                    return buildSnapshotChange({
                      command: snapshot.command,
                      metadata: snapshot.metadata,
                      nextSnapshot,
                      operations,
                      previousSnapshot: previousSnapshotForChange,
                      reason: snapshot.reason,
                      statePatches: snapshot.statePatches,
                      tags: [...snapshot.tags],
                    });
                  })()
                : (() => {
                    const topLevelStructuralChange = operations.every(
                      operationTouchesOnlyTopLevelPaths
                    );
                    const localPathStableChange =
                      operations.length > 0 &&
                      operations.every(
                        (operation) =>
                          operation.type === 'insert_text' ||
                          operation.type === 'remove_text' ||
                          operation.type === 'set_selection'
                      );
                    const pathStableStructuralChange =
                      operations.length > 0 &&
                      operations.every(
                        (operation) => operation.type === 'set_node'
                      );
                    let previousIndexForChange: RuntimeIndexLike | undefined;

                    if (topLevelStructuralChange || selectionOnlyOperations) {
                      previousIndexForChange =
                        snapshot?.previousIndex ?? undefined;
                    } else if (
                      localPathStableChange ||
                      pathStableStructuralChange
                    ) {
                      previousIndexForChange = undefined;
                    } else if (snapshot && changeRoot) {
                      previousIndexForChange = getTransactionSnapshotIndex(
                        editor,
                        snapshot,
                        changeRoot
                      );
                    } else {
                      previousIndexForChange =
                        snapshot?.previousIndex ?? undefined;
                    }

                    const operationIndexesArePathStable =
                      snapshot &&
                      changeRoot &&
                      canBuildPathStableSnapshot(operations, changeRoot);
                    let nextIndexForChange: RuntimeIndexLike | undefined;

                    if (selectionOnlyOperations) {
                      nextIndexForChange = previousIndexForChange;
                    } else if (
                      topLevelStructuralChange ||
                      localPathStableChange ||
                      pathStableStructuralChange
                    ) {
                      nextIndexForChange = undefined;
                    } else if (operationIndexesArePathStable) {
                      nextIndexForChange = previousIndexForChange;
                    } else {
                      nextIndexForChange = changeRoot
                        ? getCurrentRootIndex(editor, changeRoot)
                        : undefined;
                    }

                    return getOperationDirtiness(editor, operations, {
                      command: snapshot?.command,
                      marksBefore:
                        snapshot && changeRoot
                          ? getRootScopedMarks(
                              snapshot.marks,
                              snapshot.selectionRoot,
                              changeRoot
                            )
                          : snapshot?.marks,
                      nextIndex: nextIndexForChange,
                      previousIndex: previousIndexForChange,
                      previousVersion,
                      reason: snapshot?.reason ?? null,
                      selectionBefore:
                        snapshot && changeRoot
                          ? getRootScopedSelection(
                              snapshot.selection,
                              snapshot.selectionRoot,
                              changeRoot
                            )
                          : snapshot?.selection,
                      statePatches: snapshot?.statePatches,
                      metadata: snapshot?.metadata,
                      tags: snapshot ? [...snapshot.tags] : [],
                    });
                  })();

          return snapshot
            ? withTransactionViewState(editor, snapshot, nextChange)
            : nextChange;
        });
        const afterCommitHandlers =
          snapshot && snapshot.afterCommitHandlers.length > 0
            ? materializeAfterCommitHandlers(
                editor,
                change,
                snapshot.afterCommitHandlers
              )
            : [];

        if (
          selectionOnlyOperations &&
          snapshot?.previousSnapshot &&
          hasSnapshotListeners(editor)
        ) {
          SNAPSHOT_CACHE.set(
            editor,
            getSelectionOnlySnapshot(editor, snapshot.previousSnapshot)
          );
        }

        profileCoreDuration('notify-listeners', () =>
          notifyListeners(editor, change)
        );
        profileCoreDuration('run-after-commit-handlers', () =>
          runAfterCommitHandlers(afterCommitHandlers)
        );
      }
    }
  }
};

export const replaceSnapshot = (editor: Editor, input: SnapshotInput) => {
  runEditorTransaction(
    editor,
    () => {
      const transaction = TRANSACTION_SNAPSHOT.get(editor);
      const existingIndex = buildSnapshotIndex(editor, getChildren(editor));
      const nextChildren = cloneValue([...input.children]);

      if (transaction) {
        transaction.reason = 'replace';
      }

      seedRuntimeIdsFromIndex(nextChildren, editor, existingIndex);
      setChildren(editor, nextChildren, { invalidateRuntimeIndex: true });
      setCurrentSelection(editor, input.selection ?? null);
      setCurrentMarks(editor, input.marks ?? null);
    },
    {
      authority: 'replace',
    }
  );
};

export const initializePublicState = <
  V extends Value,
  TExtensions extends readonly unknown[] = readonly [],
>(
  editor: Editor<V, TExtensions>,
  options: CreateEditorOptions<V, TExtensions> = {}
) => {
  const initialValue = normalizeInitialValue(options.initialValue);
  const initialChildren = initialValue.children;

  if (!NodeApi.isNodeList(initialChildren)) {
    throw new Error(
      '[Slate] initialValue is invalid! Expected a list of elements.'
    );
  }

  for (const [key, children] of Object.entries(initialValue.roots)) {
    if (!NodeApi.isNodeList(children)) {
      throw new Error(
        `[Slate] initialValue.roots.${key} is invalid! Expected a list of elements.`
      );
    }
  }

  if (initialValue.explicit && initialChildren.length === 0) {
    throw new Error(
      '[Slate] initialValue is invalid! Expected at least one element.'
    );
  }

  CHILDREN.set(editor, initialChildren);
  ROOTS.set(editor, initialValue.roots);
  CURRENT_CHILDREN_ROOT.set(editor, MAIN_ROOT_KEY);
  DOCUMENT_STATE.set(editor, initialValue.state);
  seedRuntimeIds(initialChildren, editor);
  const initialSelectionRoot =
    getPublicExplicitRangeRoot(options.initialSelection) ?? MAIN_ROOT_KEY;
  initializeSelectionState(
    editor,
    options.initialSelection ?? null,
    initialSelectionRoot
  );
  initializeNormalizationFastPath(editor);
  initializeListenerState(editor);
  LAST_COMMIT.set(editor, null);
  initializeStateFieldMap(editor);
  setOperations(editor, []);
  initializeVersionState(editor);
  initializeRuntimeIndexState(editor);
  SNAPSHOT_CACHE.delete(editor);
};
