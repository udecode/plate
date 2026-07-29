import { node as getNode } from '../editor/node';
import { nodes as getNodes } from '../editor/nodes';
import { correctDocument } from '../editor/correct-document';
import { applyAddMark } from '../editor/add-mark';
import { applyDelete } from '../editor/delete-backward';
import { applyDeleteFragment } from '../editor/delete-fragment';
import { applyInsertBreak } from '../editor/insert-break';
import { applyInsertSoftBreak } from '../editor/insert-soft-break';
import { applyInsertTextCommand } from '../editor/insert-text';
import { applyRemoveMark } from '../editor/remove-mark';
import { applyToggleMark } from '../editor/toggle-mark';
import { getFragment } from './get-fragment';
import { editorCommands } from './editor-commands';
import type { AnchorOptions } from './anchor';
import type {
  CreateEditorOptions,
  Editor,
  EditorCommit,
  EditorCommitContext,
  EditorCommitHandler,
  EditorCommand,
  EditorCommandDispatch,
  EditorCoreStateView,
  EditorCoreUpdateTransaction,
  EditorDocumentValue,
  EditorEffect,
  EditorEffectType,
  EditorExtensionInput,
  EditorExtensionReconfigureOptions,
  EditorFacet,
  EditorLeafOptions,
  EditorMarks,
  EditorNodesReadOptions,
  EditorNodesOptions,
  EditorParentOptions,
  EditorPathOptions,
  EditorPointOptions,
  EditorCorrectionTransaction,
  EditorSnapshot,
  EditorSelectionBlockOptions,
  EditorSelectionTargetOptions,
  EditorStateFragmentApi,
  EditorStateField,
  EditorStateMarksApi,
  EditorStateNodesApi,
  EditorStateSelectionApi,
  EditorStateSliceApi,
  EditorStateView,
  EditorTransaction,
  EditorTransactionBlocksApi,
  EditorTransactionBreakApi,
  EditorTransactionChanged,
  EditorTransactionFragmentApi,
  EditorTransactionMarksApi,
  EditorTransactionNodesApi,
  EditorTransactionSelectionApi,
  EditorTransactionSliceApi,
  EditorTransactionSpecBuilder,
  EditorTransactionTextApi,
  EditorUpdateContext,
  EditorUpdateTag,
  EditorUpdateTransaction,
  EditorUpdateAnnotation,
  NodeTarget,
  RootKey,
  RuntimeId,
  Selection,
  SnapshotIndex,
  SnapshotInput,
  SnapshotSelectionInput,
  StateFieldTransition,
  StateFieldValueInput,
  TransactionSpec,
  Value,
} from '../interfaces/editor';
import type {
  Element,
  ElementIn,
  ElementOrTextIn,
} from '../interfaces/element';
import { LocationApi, type Location, type Span } from '../interfaces/location';
import {
  type Ancestor,
  type Descendant,
  type DescendantIn,
  NodeApi,
  type NodeMatch,
  type NodeEntry,
  type Node as PliteNode,
} from '../interfaces/node';
import { type Path, PathApi } from '../interfaces/path';
import { type Point, PointApi } from '../interfaces/point';
import { type Range, RangeApi } from '../interfaces/range';
import { SelectionApi } from '../interfaces/selection';
import { stripLocationRoots } from '../internal/root-location';
import { isTxOnlyMethod } from './tx-only';
import { defineSemanticUpdateMethod } from './semantic-update-method';
import type { Text } from '../interfaces/text';
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
  collapse as collapseSelection,
  deselect,
  applyMove,
  select,
  setPoint,
  setSelection,
} from '../transforms-selection';
import { deleteText } from '../transforms-text';
import {
  getRuntimeIdForNode,
  getOrCreateRuntimeId,
  inheritRuntimeId,
  inheritRuntimeIds,
  seedRuntimeIds,
} from '../utils/runtime-ids';
import { cloneFrozen, cloneValue } from './clone';
import {
  areEditorJsonValuesEqual,
  cloneFrozenEditorJsonValue,
} from './value-codec';
import { ContentSlice } from './content-slice';
import { getContentSlice } from './get-content-slice';
import { createEditorEffect } from './transaction-values';
import { getDefaultInsertLocation } from '../utils';
import {
  beginAnchorTransaction,
  commitAnchorTransaction,
  enterAnchorScope,
  notifyAnchorChanges,
  suspendAnchorScopes,
} from './anchor-state';
import { normalizeNodeMatch } from '../utils/node-match';
import { notifyEditorChangeListeners } from './change-events';
import { createEditorCommit } from './commit';
import {
  classifyDocumentChangeRoot,
  getDocumentChangeAfterPaths,
  getDocumentChangeTopLevelRanges,
} from './change/classification';
import {
  getInternalDocumentChangeClassification,
  getInternalDocumentChangeEntries,
  getInternalDocumentRootChange,
  DocumentChange,
} from './change/document-change';
import { ChangeDraft, type DocumentChangeStep } from './change/builder';
import { DocumentIndex } from './change/document-index';
import type { JsonEditorValue, JsonNode } from './change/tokens';
import {
  canonicalizeRootChildren,
  constructCanonicalDocumentChange,
  getProtectedInlineSpacerEntries,
} from './representation';
import {
  getEditorRuntime,
  getEditorRuntimeOwner,
  getEditorSchema,
  type InternalEditorExtensionPublicationEntry,
  type InternalEditorRuntime,
} from './editor-runtime';
import {
  assertEditorExtensionPublicationInactive,
  getExtensionRegistry,
  hasChangeListeners as hasExtensionChangeListeners,
} from './extension-registry';
import {
  createEditorFacetDraft,
  type EditorFacetDraft,
  recordFacetCommit,
  recordFacetDraftDocumentChange,
  recordFacetDraftFieldChange,
  recordFacetDraftSelectionChange,
  resolveFacet,
} from './facet';
import { normalizeEditorValue } from './initial-value';
import {
  getCommitListeners,
  getSnapshotListeners,
  getSourceListeners,
  getSourcesForChange,
  initializeListenerState,
} from './listener-state';
import { profileCoreDuration } from './profiling';
import {
  getPublicExplicitLocationRoot,
  getPublicExplicitRangeRoot,
  getReadLocationRoot,
  MAIN_ROOT_KEY,
  requireMutableRoot,
  toInternalRoot,
  toPublicRoot,
  usesImplicitSelectionLocation,
} from './public-root';
import {
  isEditorNodeSelectable,
  projectEditorExportSlice,
} from './editor-read-execution';
import {
  getSelectionStateRoot,
  getSelectionStateSelection,
  initializeSelectionState,
  setSelectionStateSelection,
} from './selection-state';
import {
  assertSelectionSupported,
  getSelectionPrimaryRange,
  getSelectionRanges,
  getSelectionReplacementRange,
  getSelectionSpecMarks,
  getSelectionSpecSlice,
  mapSelectionThroughChange,
} from './selection-protocol';
import { EditorSchemaValidationError } from './schema-validation';
import {
  advancePathStableSnapshotIndex,
  buildSnapshotIndex,
  captureSnapshotIndexMapping,
  getSnapshotIndexElementEntries,
  mapSnapshotIndexThroughChange,
} from './snapshot-index';
import {
  getInstalledStateField,
  getStateFieldIdentityMap,
  getStateFieldMap,
  initializeStateFieldMap,
  isStateFieldHydrated,
  markStateFieldHydrated,
  resolveStateFieldInitial,
  resolveStateFieldValue,
  restoreStateFieldHydration,
} from './state-fields';
import { resolveTargetRuntimeImplicitTarget } from './target-runtime';
import {
  limitNodeInsert,
  limitSliceInsert,
  limitTextInsert,
} from './insert-limit';
import {
  getCurrentUpdateTags,
  popUpdateTagContext,
  pushUpdateTagContext,
} from './update-context';
import {
  applyEditorUpdateTag,
  applyEditorUpdateTags,
  type InternalEditorUpdateOptions,
  reduceEditorUpdateTags,
} from './update-policy';

export {
  hasListeners,
  hasSnapshotListeners,
  subscribe,
  subscribeCommit,
  subscribeSource,
} from './listener-state';
export { profileCoreDuration } from './profiling';
export {
  getTargetRuntime,
  setTargetRuntime,
  withEditorTargetRuntime,
} from './target-runtime';

type AnyExtensionEditor = Editor<any, any>;

export type TransactionAuthority = 'explicit' | 'replace' | 'update';

type TransactionSnapshot = {
  activeChange: {
    change: DocumentChange;
  };
  baseRuntimeIndexes: Record<string, () => SnapshotIndex>;
  baseSnapshots: Record<string, EditorSnapshot>;
  builder: ChangeDraft;
  afterCommitHandlers: TransactionAfterCommitHandler[];
  annotations: Map<
    string,
    { type: EditorUpdateAnnotation<any>; value: unknown }
  >;
  childrenRoot: string;
  contentSliceRoots: Set<string>;
  documentState: Record<string, unknown> | undefined;
  discardedRuntimeIds: Set<RuntimeId>;
  dirtyStateKeys: Set<string>;
  draftRefs: Set<{ release: () => unknown }>;
  effects: EditorEffect[];
  extensionReconfigurations: Map<
    string,
    Readonly<{
      editor?: Editor;
      input: EditorExtensionInput<any>;
      migrate?: EditorExtensionReconfigureOptions['migrate'];
      onPublished?: (cleanup: () => void) => void;
    }>
  >;
  facet: EditorFacetDraft;
  rootIndexes: Record<string, SnapshotIndex>;
  roots: Record<string, readonly Descendant[]>;
  tags: Set<EditorUpdateTag>;
  transactionChangeObservers: Set<
    import('../interfaces/editor').EditorTransactionChangeHandler
  >;
  token: TransactionToken;
  implicitTarget: Selection;
  implicitTargetResolved: boolean;
  previousSnapshot: EditorSnapshot | null;
  previousVersion: number;
  protectedInlineSpacerPaths: Map<string, Path[]>;
  reason: 'replace' | null;
  runtimeIndexRollbacks: Map<SnapshotIndex, () => void>;
  selection: Selection;
  selectionRoot: string;
  skipCorrections: boolean;
};

const requireCommittedTransactionSnapshot = (
  snapshot: TransactionSnapshot | undefined
): TransactionSnapshot & { previousSnapshot: EditorSnapshot } => {
  if (!snapshot?.previousSnapshot) {
    throw new Error('Missing transaction snapshot for committed change.');
  }

  return snapshot as TransactionSnapshot & {
    previousSnapshot: EditorSnapshot;
  };
};

type TransactionToken = {
  active: boolean;
};

type TransactionAfterCommitHandler = {
  handler: EditorCommitHandler;
  root: string;
};

type MaterializedAfterCommitHandler = {
  context: EditorCommitContext;
  handler: EditorCommitHandler;
};

const CHILDREN = new WeakMap<Editor, readonly Descendant[]>();
const ROOTS = new WeakMap<
  Editor,
  Readonly<Record<string, readonly Descendant[]>>
>();
const DOCUMENT_STATE = new WeakMap<
  Editor,
  Record<string, unknown> | undefined
>();
const EDITOR_COMPOSING = new WeakMap<AnyExtensionEditor, boolean>();
const EDITOR_FOCUSED = new WeakMap<AnyExtensionEditor, boolean>();
const EDITOR_MAX_LENGTH = new WeakMap<AnyExtensionEditor, number | undefined>();
const EDITOR_READ_ONLY = new WeakMap<AnyExtensionEditor, boolean>();
const EDITOR_DEFAULT_BLOCK_TYPE = new WeakMap<AnyExtensionEditor, string>();
const EDITOR_VIEW_STATE_LISTENERS = new WeakMap<
  AnyExtensionEditor,
  Set<() => void>
>();
const LAST_COMMIT = new WeakMap<Editor, EditorCommit | null>();
const SNAPSHOT_CACHE = new WeakMap<Editor, Map<string, EditorSnapshot>>();
const SNAPSHOT_INPUT_TRANSFORMS = new WeakMap<
  Editor,
  (input: SnapshotInput) => SnapshotInput
>();

/** @internal Install one host-owned transform before external snapshot fitting. */
export const setEditorSnapshotInputTransform = (
  editor: Editor,
  transform: ((input: SnapshotInput) => SnapshotInput) | undefined
) => {
  const owner = getEditorRuntimeOwner(editor);
  const previous = SNAPSHOT_INPUT_TRANSFORMS.get(owner);

  if (transform) {
    SNAPSHOT_INPUT_TRANSFORMS.set(owner, transform);
  } else {
    SNAPSHOT_INPUT_TRANSFORMS.delete(owner);
  }

  return () => {
    if (SNAPSHOT_INPUT_TRANSFORMS.get(owner) !== transform) return;

    if (previous) {
      SNAPSHOT_INPUT_TRANSFORMS.set(owner, previous);
    } else {
      SNAPSHOT_INPUT_TRANSFORMS.delete(owner);
    }
  };
};

type TransactionSpecContext = {
  activeChildrenRoot?: string;
  activeUpdateRoot?: string;
  baseDraftEpoch: number;
  baseRevision: number;
  changed: boolean;
  currentChildrenRoot: string;
  depth: number;
  documentState: Record<string, unknown> | undefined;
  draftEpoch: number;
  exitAnchorScope: () => void;
  id: object;
  kind: 'spec' | 'update';
  mutationVersion: number;
  parentId?: object;
  selection: Selection;
  selectionRoot: string;
  selectionWritten: boolean;
  snapshot: TransactionSnapshot;
  transactionView?: EditorTransaction;
  updateView?: { token: TransactionToken; view: object };
};

const TRANSACTION_SPEC_CONTEXTS = new WeakMap<
  Editor,
  TransactionSpecContext[]
>();
const TRANSACTION_SPEC_DRAFT_READ_DEPTH = new WeakMap<Editor, number>();

const getTransactionSpecContext = (editor: Editor) =>
  TRANSACTION_SPEC_CONTEXTS.get(editor)?.at(-1);

/** Allow one internal state read to observe the active command-spec draft. */
export const withTransactionSpecDraftRead = <T>(
  editor: Editor,
  fn: () => T
): T => {
  const depth = TRANSACTION_SPEC_DRAFT_READ_DEPTH.get(editor) ?? 0;

  TRANSACTION_SPEC_DRAFT_READ_DEPTH.set(editor, depth + 1);

  try {
    return fn();
  } finally {
    if (depth === 0) TRANSACTION_SPEC_DRAFT_READ_DEPTH.delete(editor);
    else TRANSACTION_SPEC_DRAFT_READ_DEPTH.set(editor, depth);
  }
};

const suspendTransactionSpecDraft = (editor: Editor) => {
  const contexts = TRANSACTION_SPEC_CONTEXTS.get(editor);

  if (!contexts || contexts.length === 0) return () => {};

  TRANSACTION_SPEC_CONTEXTS.delete(editor);
  const restoreAnchorScopes = suspendAnchorScopes(editor);

  return () => {
    if ((TRANSACTION_SPEC_CONTEXTS.get(editor)?.length ?? 0) > 0) {
      throw new Error(
        'Transaction spec contexts leaked from an ambient editor read.'
      );
    }

    restoreAnchorScopes();
    TRANSACTION_SPEC_CONTEXTS.set(editor, contexts);
  };
};

const getTransactionSnapshot = (editor: Editor) =>
  getTransactionSpecContext(editor)?.snapshot;

/** @internal Final semantic tags visible to the active command layer. */
export const getActiveEditorUpdateTags = (
  editor: Editor
): readonly EditorUpdateTag[] => {
  const owner = getEditorRuntimeOwner(editor);
  const contexts = TRANSACTION_SPEC_CONTEXTS.get(owner) ?? [];

  return reduceEditorUpdateTags([
    ...getCurrentUpdateTags(owner),
    ...contexts.flatMap((context) => [...context.snapshot.tags]),
  ]);
};

const closeTransactionDraftRefs = (snapshot: TransactionSnapshot) => {
  snapshot.token.active = false;
  for (const ref of snapshot.draftRefs) ref.release();
  snapshot.draftRefs.clear();
};

const getDocumentState = (editor: Editor) => {
  const context = getTransactionSpecContext(editor);

  return context ? context.documentState : DOCUMENT_STATE.get(editor);
};

const setDocumentState = (
  editor: Editor,
  value: Record<string, unknown> | undefined
) => {
  const context = getTransactionSpecContext(editor);

  if (context) {
    context.documentState = value;
    return;
  }

  if (value === undefined) DOCUMENT_STATE.delete(editor);
  else DOCUMENT_STATE.set(editor, value);
};
const copyDocumentState = (
  value: Readonly<Record<string, unknown>> | undefined
) => (value ? { ...value } : undefined);
const ACTIVE_CHILDREN_ROOT = new WeakMap<Editor, string>();
const CURRENT_CHILDREN_ROOT = new WeakMap<Editor, string>();
const ACTIVE_UPDATE_ROOT = new WeakMap<Editor, string>();
const MUTATION_VERSION = new WeakMap<Editor, number>();
const READ_DEPTH = new WeakMap<Editor, number>();
const SNAPSHOT_VERSION = new WeakMap<Editor, number>();
const TRANSACTION_DEPTH = new WeakMap<Editor, number>();
const COMMIT_NOTIFICATION_DEPTH = new WeakMap<Editor, number>();
const POST_COMMIT_NOTIFICATION_QUEUE = new WeakMap<Editor, Array<() => void>>();
const TRANSACTION_SPEC_BASE = new WeakMap<
  TransactionSpec,
  Readonly<{
    context?: object;
    draftEpoch: number;
    editor: Editor;
    revision: number;
  }>
>();
const TRANSACTION_SPEC_PARENT = new WeakMap<TransactionSpec, TransactionSpec>();
const TRANSACTION_SPEC_DOCUMENT_STATES = new WeakMap<
  TransactionSpec,
  Record<string, unknown> | undefined
>();
const TRANSACTION_SPEC_CONTENT_SLICE_ROOTS = new WeakMap<
  TransactionSpec,
  readonly string[]
>();
const PREPARED_TRANSACTION_SPECS = new WeakMap<
  TransactionSpec,
  Readonly<{
    deferValidation: boolean;
    discardedRuntimeIds: ReadonlySet<RuntimeId>;
    document: object;
  }>
>();

export const scheduleAfterCommitNotification = (
  editor: Editor,
  callback: () => void
) => {
  if ((COMMIT_NOTIFICATION_DEPTH.get(editor) ?? 0) === 0) {
    callback();
    return;
  }

  const queue = POST_COMMIT_NOTIFICATION_QUEUE.get(editor) ?? [];

  queue.push(callback);
  POST_COMMIT_NOTIFICATION_QUEUE.set(editor, queue);
};

const flushPostCommitNotificationQueue = (editor: Editor) => {
  const queue = POST_COMMIT_NOTIFICATION_QUEUE.get(editor);

  if (!queue) return;

  POST_COMMIT_NOTIFICATION_QUEUE.delete(editor);

  for (const callback of queue) callback();
};

const scheduleMicrotask =
  typeof queueMicrotask === 'function'
    ? queueMicrotask
    : (callback: () => void) => {
        Promise.resolve().then(callback);
      };

export const getEditorChildrenRoot = (editor: Editor): string | undefined =>
  getTransactionSpecContext(editor)?.activeChildrenRoot ??
  ACTIVE_CHILDREN_ROOT.get(editor);

export const getActiveUpdateRoot = (editor: Editor): string | undefined =>
  getTransactionSpecContext(editor)?.activeUpdateRoot ??
  ACTIVE_UPDATE_ROOT.get(editor);

export const withEditorUpdateRoot = <T>(
  editor: Editor,
  root: string,
  fn: () => T
): T => {
  const context = getTransactionSpecContext(editor);

  if (context) {
    const previousRoot = context.activeUpdateRoot;
    context.activeUpdateRoot = root;

    try {
      return fn();
    } finally {
      context.activeUpdateRoot = previousRoot;
    }
  }

  const previousRoot = ACTIVE_UPDATE_ROOT.get(editor);
  ACTIVE_UPDATE_ROOT.set(editor, root);

  try {
    return fn();
  } finally {
    if (previousRoot === undefined) {
      ACTIVE_UPDATE_ROOT.delete(editor);
    } else {
      ACTIVE_UPDATE_ROOT.set(editor, previousRoot);
    }
  }
};

export const getEditorUpdateRoot = (editor: Editor): string =>
  getActiveUpdateRoot(editor) ?? MAIN_ROOT_KEY;

export const isInTransaction = (editor: Editor) =>
  getEditorTransactionDepth(editor) > 0;

export const getEditorReadDepth = (editor: Editor) =>
  READ_DEPTH.get(editor) ?? 0;

export const getEditorTransactionDepth = (editor: Editor) =>
  getTransactionSpecContext(editor)?.depth ??
  TRANSACTION_DEPTH.get(editor) ??
  0;

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
  const context = getTransactionSpecContext(editor);

  if (context) {
    context.depth = depth + 1;
    return;
  }

  TRANSACTION_DEPTH.set(editor, depth + 1);
};

export const decrementEditorTransactionDepth = (editor: Editor) => {
  const context = getTransactionSpecContext(editor);

  if (context) {
    context.depth -= 1;
    return context.depth;
  }

  const nextDepth = (TRANSACTION_DEPTH.get(editor) ?? 1) - 1;
  TRANSACTION_DEPTH.set(editor, nextDepth);

  return nextDepth;
};

export const assertCanStartEditorWrite = (
  editor: Editor,
  authority?: TransactionAuthority
) => {
  assertEditorExtensionPublicationInactive(editor);

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
  getTransactionSpecContext(editor)?.mutationVersion ??
  MUTATION_VERSION.get(editor) ??
  0;

export const getSnapshotVersion = (editor: Editor) => getVersion(editor);

const setSnapshotVersion = (editor: Editor, version: number) => {
  SNAPSHOT_VERSION.set(editor, version);
};

const bumpMutationVersion = (editor: Editor) => {
  const context = getTransactionSpecContext(editor);

  if (context) {
    context.mutationVersion += 1;
    return;
  }

  MUTATION_VERSION.set(editor, getMutationVersion(editor) + 1);
};

const initializeVersionState = (editor: Editor) => {
  MUTATION_VERSION.set(editor, 0);
  setSnapshotVersion(editor, 0);
};

const createEditorDocumentValue = <V extends Value>({
  children,
  fields,
  meta,
  roots,
}: {
  children: V;
  fields: ReadonlyMap<string, Pick<EditorStateField, 'persist' | 'serialize'>>;
  meta: Record<string, unknown> | undefined;
  roots: Readonly<Record<string, readonly Descendant[]>>;
}): EditorDocumentValue<V> => {
  const mainChildren = (roots[MAIN_ROOT_KEY] ?? children) as unknown as V;
  const extraRoots = Object.fromEntries(
    Object.entries(roots)
      .filter(([key]) => key !== MAIN_ROOT_KEY)
      .map(([root, rootChildren]) => [root, rootChildren as unknown as V])
  ) as Record<string, V>;
  const persistentMeta =
    meta === undefined
      ? undefined
      : Object.fromEntries(
          Object.entries(meta).flatMap(([key, value]) => {
            const field = fields.get(key);

            if (!field) return [[key, cloneFrozen(value)]];
            if (!field.persist) return [];

            return [[key, field.serialize(value)]];
          })
        );
  const hasExtraRoots = Object.keys(extraRoots).length > 0;
  const hasPersistentMeta =
    persistentMeta !== undefined && Object.keys(persistentMeta).length > 0;
  const immutableChildren = Object.isFrozen(mainChildren)
    ? mainChildren
    : cloneFrozen(mainChildren);
  const immutableRoots = hasExtraRoots
    ? Object.freeze(
        Object.fromEntries(
          Object.entries(extraRoots).map(([root, rootChildren]) => [
            root,
            Object.isFrozen(rootChildren)
              ? rootChildren
              : cloneFrozen(rootChildren),
          ])
        )
      )
    : undefined;
  const value = {
    children: immutableChildren,
    ...(hasPersistentMeta ? { meta: cloneFrozen(persistentMeta) } : {}),
    ...(immutableRoots ? { roots: immutableRoots } : {}),
  };

  return Object.freeze(value) as EditorDocumentValue<V>;
};

const getCurrentChildrenRoot = (editor: Editor): string =>
  getTransactionSpecContext(editor)?.currentChildrenRoot ??
  CURRENT_CHILDREN_ROOT.get(editor) ??
  MAIN_ROOT_KEY;

const getCachedSnapshot = (
  editor: Editor,
  root = getCurrentChildrenRoot(editor)
) =>
  getTransactionSpecContext(editor)
    ? undefined
    : SNAPSHOT_CACHE.get(editor)?.get(root);

const setCachedSnapshot = (
  editor: Editor,
  snapshot: EditorSnapshot,
  root = getCurrentChildrenRoot(editor)
) => {
  if (getTransactionSpecContext(editor)) return;

  const cache = SNAPSHOT_CACHE.get(editor) ?? new Map();

  cache.set(root, snapshot);
  SNAPSHOT_CACHE.set(editor, cache);
};

const clearSnapshotCache = (editor: Editor) => {
  if (getTransactionSpecContext(editor)) return;

  SNAPSHOT_CACHE.delete(editor);
};

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

const assertPathShape = (path: Path) => {
  if (!PathApi.isPath(path)) {
    throw new Error('Got non-numeric path index');
  }
};

const assertLocationPathShape = (location: Location | Span) => {
  if (LocationApi.isSpan(location)) {
    assertPathShape(location[0]);
    assertPathShape(location[1]);
    return;
  }

  if (PathApi.isPath(location)) {
    return;
  }

  if (LocationApi.isPoint(location)) {
    assertPathShape(location.path);
    return;
  }

  assertPathShape(location.anchor.path);
  assertPathShape(location.focus.path);
};

const hasLocationPath = (
  editor: Editor,
  location: Location | Span
): boolean => {
  assertLocationPathShape(location);

  if (LocationApi.isSpan(location)) {
    return NodeApi.has(editor, location[0]) && NodeApi.has(editor, location[1]);
  }

  if (PathApi.isPath(location)) {
    return NodeApi.has(editor, location);
  }

  if (LocationApi.isPoint(location)) {
    return NodeApi.has(editor, location.path);
  }

  return (
    NodeApi.has(editor, location.anchor.path) &&
    NodeApi.has(editor, location.focus.path)
  );
};

const hasReadableNodeCollection = (
  editor: Editor,
  options: { at?: Location | Span } | undefined
): boolean => options?.at === undefined || hasLocationPath(editor, options.at);

const readNodeEntry = <T extends PliteNode>(
  editor: Editor,
  at: Location
): NodeEntry<T> | undefined => {
  if (!hasLocationPath(editor, at)) return;

  return getNode(editor, at) as NodeEntry<T>;
};

const readNodePath = (
  editor: Editor,
  at: Location,
  options: EditorPathOptions = {}
): Path | undefined => {
  if (!hasLocationPath(editor, at)) return;

  const path = getEditorRuntime(editor).path(at, options);
  assertPathShape(path);

  if (NodeApi.has(editor, path)) return path;
};

const resolveNodeTargetLocation = (
  editor: Editor,
  target: NodeTarget
): Location | undefined => {
  if (
    typeof target === 'object' &&
    target !== null &&
    !Array.isArray(target) &&
    'path' in target &&
    !('offset' in target) &&
    Array.isArray(target.path)
  ) {
    return target.path as Path;
  }

  if (!NodeApi.isDescendant(target)) {
    return target as Location;
  }

  const runtimeId = getRuntimeIdForNode(target, getEditorRuntimeOwner(editor));

  return runtimeId
    ? (getPathByRuntimeId(editor, runtimeId) ?? undefined)
    : undefined;
};

const resolveReadableNodeTarget = (
  editor: Editor,
  target: NodeTarget
): Location | undefined => resolveNodeTargetLocation(editor, target);

type NodeTargetOptions = { at?: NodeTarget };

const getNodeTargetRoot = (target: NodeTarget | undefined) => {
  if (
    typeof target === 'object' &&
    target !== null &&
    !Array.isArray(target) &&
    'path' in target &&
    !('offset' in target) &&
    'root' in target &&
    typeof target.root === 'string'
  ) {
    return target.root;
  }

  return NodeApi.isDescendant(target)
    ? undefined
    : getPublicExplicitLocationRoot(target as Location | undefined);
};

const localizeLocation = (location: Location): Location =>
  LocationApi.isPath(location) ? location : stripLocationRoots(location);

type NodeMatchOptions = {
  match?: NodeMatch<PliteNode>;
};

type ResolvedNodeTargetOptions<TOptions extends NodeTargetOptions> = Omit<
  TOptions,
  'at'
> & {
  at?: Location;
};

const normalizeNodeMatchOption = <TOptions extends object>(
  options: TOptions
): TOptions => {
  if (!('match' in options)) return options;

  const match = normalizeNodeMatch((options as NodeMatchOptions).match);

  return { ...options, match };
};

const resolveNodeTargetOptions = <TOptions extends NodeTargetOptions>(
  editor: Editor,
  options: TOptions | undefined
): null | ResolvedNodeTargetOptions<TOptions> | undefined => {
  if (!options || options.at === undefined) {
    return options
      ? normalizeNodeMatchOption(options as ResolvedNodeTargetOptions<TOptions>)
      : undefined;
  }

  const at = resolveNodeTargetLocation(editor, options.at);

  if (at === undefined) return null;

  return normalizeNodeMatchOption({
    ...options,
    at,
  } as ResolvedNodeTargetOptions<TOptions>);
};

type NodeTargetOrSpanOptions = { at?: NodeTarget | Span };

type ResolvedNodeTargetOrSpanOptions<TOptions extends NodeTargetOrSpanOptions> =
  Omit<TOptions, 'at'> & {
    at?: Location | Span;
  };

const resolveNodeTargetOrSpanOptions = <
  TOptions extends NodeTargetOrSpanOptions,
>(
  editor: Editor,
  options: TOptions | undefined
): null | ResolvedNodeTargetOrSpanOptions<TOptions> | undefined => {
  if (!options || options.at === undefined) {
    return options
      ? normalizeNodeMatchOption(
          options as ResolvedNodeTargetOrSpanOptions<TOptions>
        )
      : undefined;
  }
  if (LocationApi.isSpan(options.at as Location | Span)) {
    return normalizeNodeMatchOption(
      options as ResolvedNodeTargetOrSpanOptions<TOptions>
    );
  }

  const at = resolveNodeTargetLocation(editor, options.at as NodeTarget);

  if (at === undefined) return null;

  return normalizeNodeMatchOption({
    ...options,
    at,
  } as ResolvedNodeTargetOrSpanOptions<TOptions>);
};

const readNodeChildren = (
  editor: Editor,
  at: Location = []
): readonly PliteNode[] => {
  if (!hasLocationPath(editor, at)) {
    return [];
  }

  if (Array.isArray(at) && at.length === 0) {
    return getChildren(editor) as readonly PliteNode[];
  }

  const [node] = getNode(editor, at);

  return 'children' in node && Array.isArray(node.children)
    ? node.children
    : [];
};

const readNodeFirst = (editor: Editor, at: Location): NodeEntry | undefined => {
  if (!hasLocationPath(editor, at)) return;

  return getEditorRuntime(editor).first(at);
};

const readNodeLeaf = (
  editor: Editor,
  at: Location,
  options: EditorLeafOptions = {}
): NodeEntry<Text> | undefined => {
  if (!hasLocationPath(editor, at)) return;

  return getEditorRuntime(editor).leaf(at, options);
};

const readNodeParent = (
  editor: Editor,
  at: Location,
  options: EditorParentOptions = {}
): NodeEntry<Ancestor> | undefined => {
  if (PathApi.isPath(at) && at.length === 0) return;

  if (!hasLocationPath(editor, at)) return;

  return getEditorRuntime(editor).parent(at, options);
};

const readPoint = (
  editor: Editor,
  at: Location,
  options: EditorPointOptions = {}
): Point | undefined => {
  if (!hasLocationPath(editor, at)) return;

  return getEditorRuntime(editor).point(at, options);
};

const readPointEdge = (
  editor: Editor,
  at: Location,
  edge: 'start' | 'end'
): Point | undefined => readPoint(editor, at, { edge });

const readAdjacentPoint = (
  editor: Editor,
  at: Location,
  direction: 'after' | 'before',
  options = {}
): Point | undefined => {
  if (!hasLocationPath(editor, at)) {
    return;
  }

  return direction === 'after'
    ? getEditorRuntime(editor).after(at, options)
    : getEditorRuntime(editor).before(at, options);
};

const readRangeEdges = (
  editor: Editor,
  at: Location
): readonly [Point, Point] | undefined => {
  if (!hasLocationPath(editor, at)) return;

  return getEditorRuntime(editor).edges(at);
};

const readRange = (
  editor: Editor,
  at: Location,
  to?: Location
): Range | undefined => {
  if (!hasLocationPath(editor, at) || (to && !hasLocationPath(editor, to))) {
    return;
  }

  return getEditorRuntime(editor).range(at, to);
};

const readRangeFromEntries = (
  editor: Editor,
  entries: readonly NodeEntry[]
): Range | undefined => {
  const first = entries[0];
  const last = entries.at(-1);

  if (!first || !last) return;

  return readRange(editor, first[1], last[1]);
};

export const activateStateField = <TValue>(
  editor: Editor,
  field: EditorStateField<TValue>
) => {
  const previousState = getDocumentState(editor);
  const wasHydrated = isStateFieldHydrated(editor, field.key);
  const rollback = () => {
    setDocumentState(editor, previousState);
    restoreStateFieldHydration(editor, field.key, wasHydrated);
  };

  try {
    const existingState = getDocumentState(editor);

    if (existingState && Object.hasOwn(existingState, field.key)) {
      if (!isStateFieldHydrated(editor, field.key)) {
        if (!field.persist) {
          throw new Error(
            `State field "${field.key}" cannot load persisted metadata without a codec.`
          );
        }

        setDocumentState(editor, {
          ...existingState,
          [field.key]: cloneFrozen(field.deserialize(existingState[field.key])),
        });
        markStateFieldHydrated(editor, field.key);
      }
      return rollback;
    }

    const initial = resolveStateFieldInitial(field);

    if (initial === undefined) {
      markStateFieldHydrated(editor, field.key);
      return rollback;
    }

    setDocumentState(editor, {
      ...(existingState ?? {}),
      [field.key]: cloneFrozen(initial),
    });
    markStateFieldHydrated(editor, field.key);
    return rollback;
  } catch (error) {
    rollback();
    throw error;
  }
};

const getStateFieldValue = <TValue>(
  editor: Editor,
  field: EditorStateField<TValue>
): TValue => {
  getInstalledStateField(editor, field);

  const state = getDocumentState(editor);

  if (state && Object.hasOwn(state, field.key)) {
    return state[field.key] as TValue;
  }

  return resolveStateFieldInitial(field) as TValue;
};

const setStateFieldValue = <TValue>(
  editor: Editor,
  field: EditorStateField<TValue>,
  value: StateFieldValueInput<TValue>,
  options?: { emitEffect?: boolean }
) => {
  getInstalledStateField(editor, field);

  const previousValue = getStateFieldValue(editor, field);
  const nextValue = resolveStateFieldValue(previousValue, value);

  if (field.compare(previousValue, nextValue)) {
    return;
  }

  const storedValue = cloneFrozen(nextValue);

  if (options?.emitEffect !== false) {
    const snapshot = getTransactionSnapshot(editor);
    const previousEffect = snapshot?.effects.at(-1);

    emitEditorEffect(editor, field.effect, {
      previousValue,
      value: storedValue,
    });

    if (snapshot && previousEffect?.type === field.effect) {
      const baseline = (previousEffect.value as StateFieldTransition<TValue>)
        .previousValue;

      snapshot.effects.splice(
        -2,
        2,
        ...(field.compare(baseline, storedValue)
          ? []
          : [
              Object.freeze({
                type: field.effect,
                value: Object.freeze({
                  previousValue: cloneValue(baseline),
                  value: cloneValue(storedValue),
                }),
              }),
            ])
      );

      const currentState = getDocumentState(editor);
      const currentHasValue = currentState
        ? Object.hasOwn(currentState, field.key)
        : false;
      const baselineHasValue = snapshot.documentState
        ? Object.hasOwn(snapshot.documentState, field.key)
        : false;

      if (
        currentHasValue === baselineHasValue &&
        (!currentHasValue ||
          field.compare(
            currentState?.[field.key] as TValue,
            snapshot.documentState?.[field.key] as TValue
          ))
      ) {
        snapshot.dirtyStateKeys.delete(field.key);
      }
    }

    return;
  }

  setStateValueByKey(editor, field.key, storedValue, previousValue);
};

const setStateValueByKey = (
  editor: Editor,
  key: string,
  nextValue: unknown,
  previousValue = getDocumentState(editor)?.[key]
) => {
  const existingState = getDocumentState(editor);
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
    nextState[key] = cloneFrozen(nextValue);
  }

  if (Object.keys(nextState).length === 0) {
    setDocumentState(editor, undefined);
  } else {
    setDocumentState(editor, nextState);
  }

  const snapshot = getTransactionSnapshot(editor);
  if (snapshot) {
    snapshot.dirtyStateKeys.add(key);
    recordFacetDraftFieldChange(snapshot.facet, key);
  }

  bumpMutationVersion(editor);
  markTransactionChanged(editor);
};

function emitEditorEffect<TValue>(
  editor: Editor,
  type: EditorEffectType<TValue>,
  value: TValue
) {
  const snapshot = getTransactionSnapshot(editor);
  const installed = getExtensionRegistry(editor).effectTypes.get(type.key);

  if (!snapshot) {
    throw new Error('Effects can only be emitted during editor.update');
  }
  if (!installed) {
    throw new Error(
      `Editor effect "${type.key}" is not installed. Add it to an extension's effects.`
    );
  }
  if (installed.type !== type) {
    throw new Error(
      `Editor effect "${type.key}" does not match the installed descriptor from "${installed.extensionName}".`
    );
  }

  const effect = createEditorEffect(type, value);

  snapshot.effects.push(effect);

  for (const field of getStateFieldMap(editor).values()) {
    if (!field.reduce) continue;

    const previous = getStateFieldValue(editor, field);
    const next = field.reduce(previous, effect);

    setStateFieldValue(editor, field, next, { emitEffect: false });
  }

  markTransactionChanged(editor);
}

export const getCollabEffects = (
  _editor: Editor,
  commit: EditorCommit
): readonly EditorEffect[] =>
  commit.effects.filter((effect) => effect.type.collab === 'shared');

export const getCollabEffectTypes = (
  editor: Editor
): readonly EditorEffectType[] =>
  Object.freeze(
    [...getExtensionRegistry(editor).effectTypes.values()]
      .map((registration) => registration.type)
      .filter((effect) => effect.collab === 'shared')
  );

export const getStateFieldEffectTypes = (
  editor: Editor
): readonly EditorEffectType[] =>
  Object.freeze(
    [...getStateFieldMap(editor).values()].map((field) => field.effect)
  );

const getImplicitSelectionRoot = (editor: Editor): string | undefined =>
  getCurrentSelection(editor) ? getCurrentSelectionRoot(editor) : undefined;

const getActiveMutationRoot = (editor: Editor): string | undefined =>
  getEditorChildrenRoot(editor) ?? getActiveUpdateRoot(editor);

const getMutationRoot = (
  editor: Editor,
  options?: { at?: Location }
): string | undefined => {
  if (options?.at !== undefined) {
    return (
      getPublicExplicitLocationRoot(options.at) ??
      getActiveMutationRoot(editor) ??
      MAIN_ROOT_KEY
    );
  }

  const activeRoot = getActiveMutationRoot(editor);
  const selectionRoot = getImplicitSelectionRoot(editor);

  if (!selectionRoot) {
    return activeRoot;
  }

  if (!activeRoot || activeRoot === selectionRoot) {
    return selectionRoot;
  }

  const transactionSnapshot = getTransactionSnapshot(editor);

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
      ? withEditorUpdateRoot(editor, root, () =>
          withEditorUpdateRootChildren(editor, root, fn)
        )
      : fn()
  );

const getCurrentRuntimeIndex = (editor: Editor): SnapshotIndex => {
  const root = getCurrentChildrenRoot(editor);
  const transactionSnapshot = getTransactionSnapshot(editor);

  if (transactionSnapshot) {
    return getTransactionSnapshotIndex(editor, transactionSnapshot, root);
  }

  return getSnapshot(editor).index;
};

const setVersion = (editor: Editor, version: number) => {
  setSnapshotVersion(editor, version);
  clearSnapshotCache(editor);
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

  const snapshot = getTransactionSnapshot(editor);

  if (snapshot) {
    applyEditorUpdateTags(snapshot.tags, tags);
  }

  try {
    return fn();
  } finally {
    popUpdateTagContext(editor);
  }
};

export const markTransactionChanged = (editor: Editor) => {
  const context = getTransactionSpecContext(editor);

  if (context) {
    context.changed = true;
  }
};

export const stageEditorExtensionConfiguration = (
  editor: Editor,
  key: string,
  input: EditorExtensionInput<any>,
  onPublished?: (cleanup: () => void) => void,
  extensionEditor?: Editor,
  options: EditorExtensionReconfigureOptions = {}
) => {
  const owner = getEditorRuntimeOwner(editor);
  const snapshot = getTransactionSnapshot(owner);

  if (!snapshot) {
    throw new Error(
      'Editor extension configuration can only be staged during editor.update.'
    );
  }

  snapshot.extensionReconfigurations.set(
    key,
    Object.freeze({
      editor: extensionEditor,
      input,
      migrate: options.migrate,
      onPublished,
    })
  );
  snapshot.dirtyStateKeys.add('$configuration');
  bumpMutationVersion(owner);
  markTransactionChanged(owner);
};

const hasTransactionNetChanges = (
  editor: Editor,
  snapshot: TransactionSnapshot | undefined
): boolean => {
  if (!snapshot) {
    return true;
  }

  if (snapshot.effects.length > 0 || snapshot.annotations.size > 0) {
    return true;
  }

  if (snapshot.extensionReconfigurations.size > 0) return true;

  if (!snapshot.activeChange.change.empty) return true;

  if (snapshot.dirtyStateKeys.size > 0) return true;

  return (
    !areEditorJsonValuesEqual(
      getCurrentSelection(editor),
      snapshot.selection
    ) || getCurrentSelectionRoot(editor) !== snapshot.selectionRoot
  );
};

export const getChildren = <V extends Value>(editor: Editor<V>): V => {
  const context = getTransactionSpecContext(editor);

  if (context) {
    const value = context.snapshot.builder.value;
    const children =
      context.currentChildrenRoot === MAIN_ROOT_KEY
        ? value.children
        : (value.roots?.[context.currentChildrenRoot] ?? []);

    return children as V;
  }

  const children = CHILDREN.get(editor);

  if (children) return children as V;

  return (editor.read?.children?.() ?? []) as V;
};

export const getEditorDocumentRoots = (
  editor: Editor
): Readonly<Record<string, readonly Descendant[]>> => {
  const context = getTransactionSpecContext(editor);

  if (context) {
    const value = context.snapshot.builder.value;

    return {
      [MAIN_ROOT_KEY]: value.children as unknown as readonly Descendant[],
      ...(value.roots as unknown as
        | Readonly<Record<string, readonly Descendant[]>>
        | undefined),
    };
  }

  const children = getChildren(editor);
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

export const getEditorDocumentValue = <V extends Value>(
  editor: Editor<V>
): EditorDocumentValue<V> =>
  withEditorRootChildren(editor, MAIN_ROOT_KEY, () =>
    createEditorDocumentValue({
      children: getChildren(editor),
      fields: getStateFieldIdentityMap(editor),
      meta: getDocumentState(editor),
      roots: getEditorDocumentRoots(editor),
    })
  );

export const getLiveNode = (
  editor: Editor,
  path: Path
): PliteNode | undefined => {
  if (path.length === 0) {
    return editor;
  }

  let node: PliteNode | undefined;
  let children: readonly Descendant[] = getChildren(editor);

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

export const getRuntimeId = (editor: Editor, path: Path): RuntimeId | null =>
  path.length === 0 ? null : getCurrentRuntimeIndex(editor).idAt(path);

/** @internal Query runtime-backed element entries in one explicit root. */
export const getEditorRuntimeElementEntries = (
  editor: Editor,
  types: readonly string[],
  root: RootKey
) =>
  withEditorRootChildren(editor, root, () =>
    getSnapshotIndexElementEntries(getCurrentRuntimeIndex(editor), types)
  );

/** @internal Read current root keys without traversing document content. */
export const getEditorRuntimeRootKeys = (editor: Editor): readonly RootKey[] =>
  Object.freeze(Object.keys(getEditorDocumentRoots(editor)));

export const getEditorRuntimeIdForNode = (
  editor: Editor,
  node: PliteNode
): RuntimeId => getOrCreateRuntimeId(node, getEditorRuntimeOwner(editor));

export const getPathByRuntimeId = (
  editor: Editor,
  runtimeId: RuntimeId
): Path | null => {
  const path = getCurrentRuntimeIndex(editor).pathOf(runtimeId);

  return path ? ([...path] as Path) : null;
};

export const getLastCommit = (editor: Editor): EditorCommit | null =>
  LAST_COMMIT.get(editor) ?? null;

export const getSelectionMarks = <V extends Value>(
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
    let inheritedFromPrevious = false;
    let propertyPath = path;

    if (anchor.offset === 0) {
      const prev = getEditorRuntime(editor).previous({
        at: path,
        match: NodeApi.isText,
      });
      const markedVoid = getEditorRuntime(editor).above({
        match: (n: PliteNode) =>
          NodeApi.isElement(n) &&
          getEditorSchema(editor).isVoid(n) &&
          getEditorSchema(editor).markableVoid(n),
      });

      if (!markedVoid) {
        const block = getEditorRuntime(editor).above({
          match: (n: PliteNode) =>
            NodeApi.isElement(n) && !getEditorSchema(editor).isInline(n),
        });

        if (prev && block) {
          const [prevNode, prevPath] = prev;
          const [, blockPath] = block;

          if (PathApi.isAncestor(blockPath, prevPath)) {
            node = prevNode;
            propertyPath = prevPath;
            inheritedFromPrevious = true;
          }
        }
      }
    }

    const { text, ...nodeProperties } = node;
    const rest: Record<string, unknown> = { ...nodeProperties };

    if (inheritedFromPrevious || anchor.offset === node.text.length) {
      for (const key of Object.keys(rest)) {
        if (
          getEditorSchema(editor).getTextPropertyAt(
            key,
            propertyPath,
            anchor.root ?? getCurrentSelectionRoot(editor)
          )?.lifecycle.inclusive === false
        ) {
          delete rest[key];
        }
      }
    }

    return rest as EditorMarks<V>;
  });
};

const createNodesToArray = (editor: Editor): EditorStateNodesApi['toArray'] => {
  function toArray<T extends PliteNode>(
    options?: EditorNodesReadOptions<T>
  ): NodeEntry<T>[];
  function toArray<T extends PliteNode, R>(
    options: EditorNodesReadOptions<T> | undefined,
    map: (entry: NodeEntry<T>) => R
  ): R[];
  function toArray<T extends PliteNode, R>(
    options: EditorNodesReadOptions<T> = {},
    map?: (entry: NodeEntry<T>) => R
  ): NodeEntry<T>[] | R[] {
    const resolvedOptions = resolveNodeTargetOrSpanOptions(editor, options);

    if (resolvedOptions === null) return [];

    return (({ map, options = {} }) =>
      withOptionsRootRead(
        editor,
        options,
        () => {
          if (!hasReadableNodeCollection(editor, options)) {
            return [];
          }

          if (map) {
            const mapped: unknown[] = [];

            for (const entry of getNodes(editor, options)) {
              mapped.push(map(entry));
            }

            return mapped;
          }

          const entries: NodeEntry<PliteNode>[] = [];

          for (const entry of getNodes(editor, options)) {
            entries.push(entry);
          }

          return entries;
        },
        { selectionFallback: usesImplicitSelectionLocation(options) }
      ))({
      map: map as ((entry: NodeEntry<PliteNode>) => unknown) | undefined,
      options: resolvedOptions as EditorNodesOptions<PliteNode>,
    }) as NodeEntry<T>[] | R[];
  }

  return toArray;
};

type SelectionBlockState<V extends Value = Value> = Pick<
  EditorCoreStateView<V>,
  'nodes'
>;

type SelectionQueryState<V extends Value = Value> = Pick<
  EditorCoreStateView<V>,
  'nodes' | 'ranges'
>;

const WHITESPACE_OR_END_REGEX = /^(?:\s|$)/;

const resolveSelectionQueryRange = (
  state: Pick<EditorStateView, 'ranges'>,
  selection: Selection,
  at: NodeTarget | null | undefined
): Range | null => {
  if (at === null) return null;
  if (at === undefined) return selection;

  return state.ranges.get(at) ?? null;
};

const getSelectionBlockEntries = <V extends Value>(
  state: SelectionBlockState<V>,
  selection: Range | null,
  options: EditorSelectionBlockOptions = {}
) => {
  if (!selection) {
    return {
      endBlock: undefined,
      startBlock: undefined,
    };
  }

  const [startPoint, endPoint] = RangeApi.edges(selection);

  return {
    endBlock: state.nodes.block({ at: endPoint, match: options.match }),
    startBlock: state.nodes.block({ at: startPoint, match: options.match }),
  };
};

export const isSelectionWithinBlock = <V extends Value>(
  state: SelectionQueryState<V>,
  selection: Selection,
  options: EditorSelectionBlockOptions = {}
) => {
  const range = resolveSelectionQueryRange(state, selection, options.at);
  const { endBlock, startBlock } = getSelectionBlockEntries(
    state,
    range,
    options
  );

  return !!(
    startBlock &&
    endBlock &&
    PathApi.equals(startBlock[1], endBlock[1])
  );
};

export const isSelectionAcrossBlocks = <V extends Value>(
  state: SelectionQueryState<V>,
  selection: Selection,
  options: EditorSelectionBlockOptions = {}
) => {
  const range = resolveSelectionQueryRange(state, selection, options.at);
  const { endBlock, startBlock } = getSelectionBlockEntries(
    state,
    range,
    options
  );

  if (!startBlock && !endBlock) return false;
  if (!startBlock || !endBlock) return true;

  return !PathApi.equals(startBlock[1], endBlock[1]);
};

export const isSelectionWithinText = (
  state: Pick<EditorStateView, 'ranges'>,
  selection: Selection,
  options: EditorSelectionTargetOptions = {}
) => {
  const range = resolveSelectionQueryRange(state, selection, options.at);

  if (!range) return false;

  const [startPoint, endPoint] = RangeApi.edges(range);

  return PathApi.equals(startPoint.path, endPoint.path);
};

export const isSelectionAtBlockStart = <V extends Value>(
  state: SelectionQueryState<V> & Pick<EditorCoreStateView<V>, 'points'>,
  selection: Selection,
  options: EditorSelectionBlockOptions = {}
) => {
  const range = resolveSelectionQueryRange(state, selection, options.at);
  const { startBlock } = getSelectionBlockEntries(state, range, options);

  if (!range || !startBlock) return false;

  const [startPoint, endPoint] = RangeApi.edges(range);

  return (
    state.points.isStart(startPoint, startBlock[1]) ||
    (RangeApi.isExpanded(range) &&
      state.points.isStart(endPoint, startBlock[1]))
  );
};

export const isSelectionAtBlockEnd = <V extends Value>(
  state: SelectionQueryState<V> & Pick<EditorCoreStateView<V>, 'points'>,
  selection: Selection,
  options: EditorSelectionBlockOptions = {}
) => {
  const range = resolveSelectionQueryRange(state, selection, options.at);
  const { endBlock } = getSelectionBlockEntries(state, range, options);

  if (!range || !endBlock) return false;

  const endPoint = RangeApi.end(range);

  if (state.points.isEnd(endPoint, endBlock[1])) return true;
  if (!state.points.isEnd(endPoint, endPoint.path)) return false;

  const pointAfter = state.points.after(endPoint, { unit: 'offset' });
  const nextBlock = pointAfter
    ? state.nodes.block({ at: pointAfter, match: options.match })
    : undefined;

  return !!nextBlock && !PathApi.equals(endBlock[1], nextBlock[1]);
};

export const doesSelectionIntersect = (
  state: Pick<EditorStateView, 'ranges'>,
  selection: Selection,
  target: NodeTarget
) => {
  if (!selection) return false;

  const range = state.ranges.get(target);

  return !!range && !!RangeApi.intersection(selection, range);
};

export const doesSelectionContain = (
  state: Pick<EditorStateView, 'ranges'>,
  selection: Selection,
  target: NodeTarget
) => {
  if (!selection) return false;

  const range = state.ranges.get(target);

  return !!range && RangeApi.surrounds(selection, range);
};

const remapContentSliceRoots = <V extends Value>(
  editor: Editor<V>,
  slice: import('../interfaces/editor').ContentSlice<V>
) => {
  if (!slice.roots || Object.keys(slice.roots).length === 0) return slice;

  const existingRoots = new Set(
    Object.keys(
      (getActiveDocumentChangeBuilder(editor).value as EditorDocumentValue)
        .roots ?? {}
    )
  );
  const remapped = new Map<string, string>();

  for (const root of Object.keys(slice.roots).sort()) {
    const base = `${root}:copy`;
    let candidate = base;
    let suffix = 2;

    while (existingRoots.has(candidate)) {
      candidate = `${base}:${suffix}`;
      suffix += 1;
    }
    existingRoots.add(candidate);
    remapped.set(root, candidate);
  }

  const rewrite = (node: Descendant): Descendant => {
    if (!NodeApi.isElement(node)) return node;
    const children = node.children.map(rewrite);
    const declarations = getEditorSchema(editor).getElementOwnedRoots(node);
    let childRoots = (node as { childRoots?: unknown }).childRoots;

    for (const declaration of declarations) {
      const replacement = remapped.get(declaration.root);

      if (!replacement) continue;
      childRoots = {
        ...(typeof childRoots === 'object' && childRoots !== null
          ? childRoots
          : {}),
        [declaration.slot]: replacement,
      };
    }

    return Object.freeze({
      ...node,
      ...(childRoots === undefined ? {} : { childRoots }),
      children: Object.freeze(children),
    }) as Descendant;
  };
  const roots = Object.freeze(
    Object.fromEntries(
      [...remapped].map(([source, target]) => [
        target,
        Object.freeze(slice.roots![source]!.map(rewrite)),
      ])
    )
  );

  return ContentSlice.fromJSON<V>({
    content: slice.content.map(rewrite),
    openEnd: slice.openEnd,
    openStart: slice.openStart,
    roots,
  });
};

const materializeContentSliceRoots = (
  editor: Editor,
  slice: import('../interfaces/editor').ContentSlice
) => {
  if (!slice.roots) return;
  const payloadRoots = new Set(Object.keys(slice.roots));
  const pending = new Set<string>();
  const created = new Set<string>();
  const collect = (children: readonly Descendant[]) => {
    const visit = (node: Descendant) => {
      if (!NodeApi.isElement(node)) return;

      for (const { root } of getEditorSchema(editor).getElementOwnedRoots(
        node
      )) {
        if (payloadRoots.has(root) && !created.has(root)) pending.add(root);
      }
      node.children.forEach(visit);
    };

    children.forEach(visit);
  };
  const current = getActiveDocumentChangeBuilder(editor)
    .value as EditorDocumentValue;

  collect(slice.content);
  collect(current.children);
  for (const children of Object.values(current.roots ?? {})) collect(children);

  while (pending.size > 0) {
    const root = [...pending].sort()[0]!;

    pending.delete(root);
    if (created.has(root)) continue;
    const content = slice.roots[root];

    if (!content) continue;
    applyDocumentChangeStep(
      editor,
      getActiveDocumentChangeBuilder(editor).createRoot(
        root,
        content as readonly JsonNode[]
      )
    );
    getTransactionSnapshot(editor)?.contentSliceRoots.add(root);
    created.add(root);

    collect(content);
  }
};

const fitSliceIntoActiveDraft = <V extends Value>(
  editor: Editor<V>,
  slice: import('../interfaces/editor').ContentSlice<V>,
  options?: Parameters<EditorTransactionSliceApi<V>['replace']>[1]
) => {
  const resolvedOptions = resolveNodeTargetOptions(editor, options);

  if (resolvedOptions === null) return false;

  const root =
    getNodeTargetRoot(options?.at) ?? getMutationRoot(editor, resolvedOptions);
  const localOptions =
    resolvedOptions?.at === undefined
      ? resolvedOptions
      : {
          ...resolvedOptions,
          at: localizeLocation(resolvedOptions.at),
        };

  return runWithMutationRoot(editor, root, () => {
    const state = getStateView(editor);
    const sourceSlice = ContentSlice.fromJSON<V>(slice);
    const inputSlice = remapContentSliceRoots(editor, sourceSlice);
    const limitedSlice = limitSliceInsert(editor, inputSlice, localOptions);

    if (limitedSlice.content.length === 0 && inputSlice.content.length > 0) {
      return false;
    }

    let at = getTransactionView(editor).resolveTarget({ at: localOptions?.at });

    if (!at) at = getDefaultInsertLocation(editor);

    let range: Range | undefined;
    let insertionBoundary: Readonly<{ from: number; to: number }> | undefined;

    if (LocationApi.isRange(at)) {
      range = at;
    } else {
      const point = LocationApi.isPoint(at)
        ? at
        : state.points.get(at, { edge: 'start' });

      if (point) {
        range = { anchor: point, focus: point };
      } else if (LocationApi.isPath(at) && at.length > 0) {
        const parentPath = PathApi.parent(at);
        const index = at.at(-1)!;
        const parentChildren =
          parentPath.length === 0
            ? getChildren(editor)
            : state.nodes.children(parentPath);

        if (index >= 0 && index <= parentChildren.length) {
          const boundaryPoint =
            (index < parentChildren.length
              ? state.points.start([...parentPath, index])
              : undefined) ??
            (index > 0
              ? state.points.end([...parentPath, index - 1])
              : undefined);

          if (boundaryPoint) {
            const position = DocumentIndex.fromValue(
              getChildren(editor) as readonly Descendant[]
            ).childPosition(parentPath, index);

            range = { anchor: boundaryPoint, focus: boundaryPoint };
            insertionBoundary = { from: position, to: position };
          }
        }
      }
    }
    if (!range) return false;

    if (!insertionBoundary && !localOptions?.hanging) {
      range = state.ranges.unhang(range, { voids: localOptions?.voids });
    }
    if (limitedSlice.content.length === 0 && RangeApi.isCollapsed(range)) {
      return false;
    }
    if (
      !insertionBoundary &&
      !localOptions?.voids &&
      getEditorRuntime(editor).void({ at: range })
    ) {
      return false;
    }

    const fit = () =>
      getEditorSchema(editor).fit(limitedSlice, {
        apply: (step, selection) =>
          applyDocumentChangeStep(
            editor,
            step,
            selection
              ? {
                  selectionAfter: selection,
                  selectionRoot: range.anchor.root ?? MAIN_ROOT_KEY,
                }
              : {}
          ),
        builder: getActiveDocumentChangeBuilder(editor),
        target: {
          at: range,
          ...(insertionBoundary
            ? {
                contentBounds: insertionBoundary,
                exactBounds: insertionBoundary,
              }
            : {}),
          kind: 'range',
        },
      });
    let fitted: boolean;

    if (limitedSlice.roots) {
      const rootSpec = createTransactionSpec(editor, () =>
        materializeContentSliceRoots(editor, limitedSlice)
      );
      let continuationFitted = false;
      const continuation = extendTransactionSpec(editor, rootSpec, () => {
        continuationFitted = fit();
      });

      fitted = continuationFitted;
      if (fitted) {
        try {
          getEditorSchema(editor).validateDocument(
            continuation.changes.apply(
              getActiveDocumentChangeBuilder(editor)
                .value as EditorDocumentValue
            ) as EditorDocumentValue
          );
        } catch (error) {
          if (error instanceof EditorSchemaValidationError) return false;
          throw error;
        }
        applyTransactionSpec(editor, continuation);
      }
    } else {
      fitted = fit();
    }

    if (!fitted) return false;

    return true;
  });
};

const createSliceFitTransactionSpec = <V extends Value>(
  editor: Editor<V>,
  slice: import('../interfaces/editor').ContentSlice<V>,
  options?: Parameters<EditorTransactionSliceApi<V>['replace']>[1]
): false | TransactionSpec => {
  let applicable = false;
  const spec = createTransactionSpec(editor, () => {
    applicable = fitSliceIntoActiveDraft(editor, slice, options);
  });

  return applicable ? spec : false;
};

const getStateView = <
  V extends Value,
  TExtensions extends readonly unknown[] = readonly [],
>(
  editor: Editor<V, TExtensions>
): EditorStateView<V, TExtensions> => {
  let state!: EditorStateView<V, TExtensions>;
  const fragmentApi = Object.freeze(((options = {}) =>
    (({ options }) => {
      const readOptions = options ?? {};

      return withOptionsRootRead(
        editor,
        readOptions,
        () => {
          if (readOptions.at && !hasLocationPath(editor, readOptions.at)) {
            return [];
          }

          return getFragment(editor, readOptions) as DescendantIn<V>[];
        },
        { selectionFallback: usesImplicitSelectionLocation(readOptions) }
      );
    })({ options })) satisfies EditorStateFragmentApi<V>);
  const marksApi = Object.freeze((() => {
    const projected = getSelectionSpecMarks(
      editor,
      getCurrentSelection(editor),
      state
    );

    return projected === undefined ? getSelectionMarks(editor) : projected;
  }) satisfies EditorStateMarksApi<V>);
  const getSlice: EditorStateSliceApi<V>['get'] = (options = {}) => {
    const selection = getCurrentSelection(editor);
    const range = options.at ?? selection;

    return withOptionsRootRead(
      editor,
      options,
      () => {
        if (options.at === undefined) {
          const projected = getSelectionSpecSlice(editor, selection, state);

          if (projected) return ContentSlice.fromJSON<V>(projected);
        }
        if (
          range &&
          RangeApi.isRange(range) &&
          !hasLocationPath(editor, range)
        ) {
          return ContentSlice.empty;
        }

        return getContentSlice(
          editor,
          range && RangeApi.isRange(range) ? range : null
        );
      },
      { selectionFallback: options.at === undefined }
    );
  };
  const sliceApi = Object.freeze({
    export: (options = {}) =>
      projectEditorExportSlice(editor, getSlice(options)),
    fit: (
      slice: import('../interfaces/editor').ContentSlice<V>,
      options?: Parameters<EditorStateSliceApi<V>['fit']>[1]
    ) => createSliceFitTransactionSpec(editor, slice, options),
    fitContent: (
      slice: import('../interfaces/editor').ContentSlice<V>,
      options: Parameters<EditorStateSliceApi<V>['fitContent']>[1]
    ) => {
      if (options.root === MAIN_ROOT_KEY) {
        throw new Error(
          '[Plite] Omit root to use the primary document context.'
        );
      }

      const scopedRoot = getCurrentChildrenRoot(editor);
      const root =
        options.root ?? (scopedRoot === MAIN_ROOT_KEY ? undefined : scopedRoot);

      return getEditorSchema(editor).fitContent(
        ContentSlice.fromJSON<V>(slice),
        {
          parent: options.parent as Element,
          ...(root === undefined ? {} : { root }),
        }
      ) as readonly DescendantIn<V>[] | null;
    },
    get: getSlice,
  }) satisfies EditorStateSliceApi<V>;
  const selectionApi = Object.freeze(
    Object.assign(() => getCurrentSelection(editor), {
      contains: (target: NodeTarget) =>
        doesSelectionContain(state, getCurrentSelection(editor), target),
      intersects: (target: NodeTarget) =>
        doesSelectionIntersect(state, getCurrentSelection(editor), target),
      isAcrossBlocks: (options?: EditorSelectionBlockOptions) =>
        isSelectionAcrossBlocks(state, getCurrentSelection(editor), options),
      isAtBlockEnd: (options?: EditorSelectionBlockOptions) =>
        isSelectionAtBlockEnd(state, getCurrentSelection(editor), options),
      isAtBlockStart: (options?: EditorSelectionBlockOptions) =>
        isSelectionAtBlockStart(state, getCurrentSelection(editor), options),
      isCollapsed: () => {
        const selection = getCurrentSelection(editor);

        return !!selection && RangeApi.isCollapsed(selection);
      },
      isExpanded: () => {
        const selection = getCurrentSelection(editor);

        return !!selection && RangeApi.isExpanded(selection);
      },
      isWithinBlock: (options?: EditorSelectionBlockOptions) =>
        isSelectionWithinBlock(state, getCurrentSelection(editor), options),
      isWithinText: (options?: EditorSelectionTargetOptions) =>
        isSelectionWithinText(state, getCurrentSelection(editor), options),
      primaryRange: () =>
        getSelectionPrimaryRange(editor, getCurrentSelection(editor)),
      ranges: () => getSelectionRanges(editor, getCurrentSelection(editor)),
      replacementRange: () =>
        getSelectionReplacementRange(editor, getCurrentSelection(editor)),
    }) satisfies EditorStateSelectionApi
  );
  const readBlock: EditorStateNodesApi<V>['block'] = (options = {}) => {
    const resolvedOptions = resolveNodeTargetOptions(editor, options);

    if (resolvedOptions === null) return;
    const nextOptions = resolvedOptions ?? {};
    const match = normalizeNodeMatch(nextOptions.match);
    const entry = getEditorRuntime(editor).above({
      ...nextOptions,
      match: (node, path) =>
        NodeApi.isElement(node) &&
        getEditorSchema(editor).isBlock(node) &&
        (match?.(node, path) ?? true),
    });

    return entry && NodeApi.isElement(entry[0])
      ? (entry as NodeEntry<any>)
      : undefined;
  };
  const coreState = {
    children: () =>
      (getEditorDocumentRoots(editor)[MAIN_ROOT_KEY] ??
        []) as unknown as readonly [...V],
    facet: <TOutput>(facet: EditorFacet<any, TOutput>) => {
      const draft = getTransactionSnapshot(editor)?.facet;

      return resolveFacet(
        editor,
        state as EditorStateView<V, TExtensions>,
        facet,
        draft?.revision ?? getVersion(editor),
        draft
      );
    },
    fragment: fragmentApi,
    getField: <TValue>(field: EditorStateField<TValue>) =>
      getStateFieldValue(editor, field),
    lastCommit: () => getLastCommit(editor) as EditorCommit<V> | null,
    marks: marksApi,
    meta: () => getEditorDocumentValue(editor).meta,
    nodes: Object.freeze<EditorStateNodesApi<V>>({
      above: <T extends Ancestor>(options = {}) => {
        const resolvedOptions = resolveNodeTargetOptions(editor, options);

        if (resolvedOptions === null) return;

        return (({ options }) =>
          getEditorRuntime(editor).above(options) as
            | NodeEntry<Ancestor>
            | undefined)({ options: resolvedOptions }) as [T, Path] | undefined;
      },
      block: readBlock,
      children(
        target: NodeTarget = []
      ): ReturnType<EditorStateNodesApi<V>['children']> {
        const at = resolveReadableNodeTarget(editor, target);

        if (!at) return [];

        return (({ at = [] }) =>
          withLocationRootRead(editor, at, () => readNodeChildren(editor, at)))(
          { at }
        ) as ReturnType<EditorStateNodesApi<V>['children']>;
      },
      elementReadOnly: (options = {}) => {
        const resolvedOptions = resolveNodeTargetOptions(editor, options);

        if (resolvedOptions === null) return;

        return (({ options }) =>
          getEditorRuntime(editor).elementReadOnly(options))({
          options: resolvedOptions,
        });
      },
      first: (target: NodeTarget) => {
        const at = resolveReadableNodeTarget(editor, target);

        if (!at) return;

        return (({ at }) =>
          withLocationRootRead(editor, at, () => readNodeFirst(editor, at)))({
          at,
        });
      },
      get: <T extends PliteNode>(target: NodeTarget) => {
        const at = resolveReadableNodeTarget(editor, target);

        if (!at) return;

        return (({ at }) =>
          withLocationRootRead(editor, at, () => readNodeEntry<T>(editor, at)))(
          { at }
        ) as NodeEntry<T> | undefined;
      },
      hasBlocks: (element: import('../interfaces/element').Element) =>
        (({ element }) => getEditorRuntime(editor).hasBlocks(element))({
          element,
        }),
      hasInlines: (element: import('../interfaces/element').Element) =>
        (({ element }) => getEditorRuntime(editor).hasInlines(element))({
          element,
        }),
      hasPath: (path: Path) =>
        (({ path }) => getEditorRuntime(editor).hasPath(path))({ path }),
      hasTexts: (element: import('../interfaces/element').Element) =>
        (({ element }) => getEditorRuntime(editor).hasTexts(element))({
          element,
        }),
      isBlock: (element: import('../interfaces/node').Node) =>
        (({ element }) => getEditorRuntime(editor).isBlock(element))({
          element,
        }),
      isSelectable: (element: import('../interfaces/node').Node) =>
        isEditorNodeSelectable(editor, element),
      isEmpty: (element: import('../interfaces/element').Element) =>
        (({ element }) => getEditorRuntime(editor).isEmpty(element))({
          element,
        }),
      last: (target: NodeTarget, options = {}) => {
        const at = resolveReadableNodeTarget(editor, target);

        if (!at) return;

        return (({ at, options }) =>
          getEditorRuntime(editor).last(at, options))({ at, options });
      },
      leaf: (target: NodeTarget, options: EditorLeafOptions = {}) => {
        const at = resolveReadableNodeTarget(editor, target);

        if (!at) return;

        return (({ at, options }) =>
          withLocationRootRead(editor, at, () =>
            readNodeLeaf(editor, at, options)
          ))({ at, options }) as ReturnType<EditorStateNodesApi<V>['leaf']>;
      },
      levels: <T extends PliteNode>(options = {}) => {
        const resolvedOptions = resolveNodeTargetOptions(editor, options);

        if (resolvedOptions === null) {
          return (function* emptyLevels() {})() as Generator<
            [T, Path],
            void,
            undefined
          >;
        }

        return (({ options }) =>
          hasReadableNodeCollection(editor, options)
            ? (getEditorRuntime(editor).levels(options) as Generator<
                NodeEntry<PliteNode>,
                void,
                undefined
              >)
            : (function* emptyLevels() {})())({
          options: resolvedOptions,
        }) as Generator<[T, Path], void, undefined>;
      },
      path: (target: NodeTarget, options: EditorPathOptions = {}) => {
        const at = resolveReadableNodeTarget(editor, target);

        if (!at) return;

        return (({ at, options }) =>
          withLocationRootRead(editor, at, () =>
            readNodePath(editor, at, options)
          ))({ at, options });
      },
      entries: <T extends PliteNode>(options = {}) => {
        const resolvedOptions = resolveNodeTargetOrSpanOptions(editor, options);

        if (resolvedOptions === null) {
          return (function* emptyEntries() {})() as Generator<
            [T, Path],
            void,
            undefined
          >;
        }

        return (({ options }) =>
          withOptionsRootGenerator(
            editor,
            options,
            () => {
              if (!hasReadableNodeCollection(editor, options)) {
                return [];
              }

              return getNodes(editor, options) as Generator<
                NodeEntry<PliteNode>,
                void,
                undefined
              >;
            },
            { selectionFallback: usesImplicitSelectionLocation(options) }
          ))({ options: resolvedOptions }) as Generator<
          [T, Path],
          void,
          undefined
        >;
      },
      find: <T extends PliteNode>(options = {}) => {
        const resolvedOptions = resolveNodeTargetOrSpanOptions(editor, options);

        if (resolvedOptions === null) return;

        return (({ options }) =>
          withOptionsRootRead(
            editor,
            options,
            () => {
              if (!hasReadableNodeCollection(editor, options)) {
                return;
              }

              for (const entry of getNodes(editor, options)) {
                return entry;
              }
            },
            { selectionFallback: usesImplicitSelectionLocation(options) }
          ))({ options: resolvedOptions }) as [T, Path] | undefined;
      },
      some: (options = {}) => {
        const resolvedOptions = resolveNodeTargetOrSpanOptions(editor, options);

        if (resolvedOptions === null) return false;

        return (({ options }) =>
          withOptionsRootRead(
            editor,
            options,
            () => {
              if (!hasReadableNodeCollection(editor, options)) {
                return false;
              }

              for (const _entry of getNodes(editor, options)) {
                return true;
              }

              return false;
            },
            { selectionFallback: usesImplicitSelectionLocation(options) }
          ))({ options: resolvedOptions });
      },
      toArray: createNodesToArray(editor),
      next: <T extends PliteNode>(options = {}) => {
        const resolvedOptions = resolveNodeTargetOptions(editor, options);

        if (resolvedOptions === null) return;

        return (({ options }) =>
          hasReadableNodeCollection(editor, options)
            ? (getEditorRuntime(editor).next(options) as
                | NodeEntry<Descendant>
                | undefined)
            : undefined)({ options: resolvedOptions }) as [T, Path] | undefined;
      },
      previous: <T extends PliteNode>(options = {}) => {
        const resolvedOptions = resolveNodeTargetOptions(editor, options);

        if (resolvedOptions === null) return;

        return (({ options }) =>
          hasReadableNodeCollection(editor, options)
            ? (getEditorRuntime(editor).previous(options) as
                | NodeEntry<PliteNode>
                | undefined)
            : undefined)({ options: resolvedOptions }) as [T, Path] | undefined;
      },
      shouldMergeNodesRemovePrevNode: (
        previous: NodeEntry,
        current: NodeEntry
      ) =>
        (({ current, previous }) =>
          getEditorRuntime(editor).shouldMergeNodesRemovePrevNode(
            previous,
            current
          ))({ current, previous }),
      parent: <T extends Ancestor = Ancestor>(
        target: NodeTarget,
        options: EditorParentOptions = {}
      ) => {
        const at = resolveReadableNodeTarget(editor, target);

        if (!at) return;

        return (({ at, options }) =>
          withLocationRootRead(editor, at, () =>
            readNodeParent(editor, at, options)
          ))({ at, options }) as NodeEntry<T> | undefined;
      },
      void: (options = {}) => {
        const resolvedOptions = resolveNodeTargetOptions(editor, options);

        if (resolvedOptions === null) return;

        return (({ options }) => getEditorRuntime(editor).void(options))({
          options: resolvedOptions,
        });
      },
    }),
    points: Object.freeze({
      after: (target: NodeTarget, options = {}) => {
        const at = resolveReadableNodeTarget(editor, target);

        if (!at) return;

        return (({ at, options }) =>
          readAdjacentPoint(editor, at, 'after', options))({ at, options });
      },
      before: (target: NodeTarget, options = {}) => {
        const at = resolveReadableNodeTarget(editor, target);

        if (!at) return;

        return (({ at, options }) =>
          readAdjacentPoint(editor, at, 'before', options))({ at, options });
      },
      end: (target: NodeTarget) => {
        const at = resolveReadableNodeTarget(editor, target);

        if (!at) return;

        return (({ at }) => readPointEdge(editor, at, 'end'))({ at });
      },
      get: (target: NodeTarget, options: EditorPointOptions = {}) => {
        const at = resolveReadableNodeTarget(editor, target);

        if (!at) return;

        return (({ at, options }) => readPoint(editor, at, options))({
          at,
          options,
        });
      },
      isEdge: (point, target) => {
        const at = resolveReadableNodeTarget(editor, target);

        if (!at) return false;

        return (({ at, point }) =>
          hasLocationPath(editor, at) &&
          getEditorRuntime(editor).isEdge(point, at))({ at, point });
      },
      isEnd: (point, target) => {
        const at = resolveReadableNodeTarget(editor, target);

        if (!at) return false;

        return (({ at, point }) =>
          hasLocationPath(editor, at) &&
          getEditorRuntime(editor).isEnd(point, at))({ at, point });
      },
      isStart: (point, target) => {
        const at = resolveReadableNodeTarget(editor, target);

        if (!at) return false;

        return (({ at, point }) =>
          hasLocationPath(editor, at) &&
          getEditorRuntime(editor).isStart(point, at))({ at, point });
      },
      isWordEnd: (point) => {
        const after = state.points.after(point);

        if (!after) return true;

        const range = state.ranges.get(point, after);

        return (
          !!range && WHITESPACE_OR_END_REGEX.test(state.text.string(range))
        );
      },
      positions: (options = {}) => {
        const resolvedOptions = resolveNodeTargetOptions(editor, options);

        if (resolvedOptions === null) {
          return (function* emptyPositions() {})();
        }

        return (({ options }) =>
          hasReadableNodeCollection(editor, options)
            ? getEditorRuntime(editor).positions(options)
            : (function* emptyPositions() {})())({ options: resolvedOptions });
      },
      start: (target: NodeTarget) => {
        const at = resolveReadableNodeTarget(editor, target);

        if (!at) return;

        return (({ at }) => readPointEdge(editor, at, 'start'))({ at });
      },
    }),
    ranges: Object.freeze({
      edges: (target: NodeTarget) => {
        const at = resolveReadableNodeTarget(editor, target);

        if (!at) return;

        return (({ at }) => readRangeEdges(editor, at))({ at });
      },
      fromEntries: (entries) =>
        (({ entries }) => readRangeFromEntries(editor, entries))({ entries }),
      get: (target: NodeTarget, to?: Location) => {
        const at = resolveReadableNodeTarget(editor, target);

        if (!at) return;

        return (({ at, to }) => readRange(editor, at, to))({ at, to });
      },
      project: (range) =>
        (({ range }) => getEditorRuntime(editor).projectRange(range))({
          range,
        }),
      unhang: (range, options = {}) =>
        (({ options, range }) =>
          getEditorRuntime(editor).unhangRange(range, options))({
          options,
          range,
        }),
    }),
    root: (root: RootKey) => {
      if (root === MAIN_ROOT_KEY) {
        throw new Error(
          '[Plite] editor.read.root("main") is invalid. Use editor.read.children().'
        );
      }

      return (getEditorDocumentRoots(editor)[root] ??
        []) as readonly V[number][];
    },
    runtime: Object.freeze({
      idAt: (path: Path) => getRuntimeId(editor, path),
      pathOf: (runtimeId) => getPathByRuntimeId(editor, runtimeId),
      snapshot: () => getSnapshot(editor) as EditorSnapshot<V>,
    }),
    schema: getEditorSchema(editor),
    selection: selectionApi,
    slice: sliceApi,
    text: Object.freeze({
      string: (target?: NodeTarget, options = {}) => {
        const resolvedTarget = target ?? getCurrentSelection(editor);

        if (!resolvedTarget) return '';

        const at = resolveReadableNodeTarget(editor, resolvedTarget);

        if (!at) return '';

        return withLocationRootRead(editor, at, () => {
          if (!hasLocationPath(editor, at)) {
            return '';
          }

          return getEditorRuntime(editor).string(at, options);
        });
      },
    }),
    value: () => getEditorDocumentValue(editor),
    view: Object.freeze({
      isComposing: () => EDITOR_COMPOSING.get(editor) ?? false,
      isFocused: () => EDITOR_FOCUSED.get(editor) ?? false,
      isReadOnly: () => EDITOR_READ_ONLY.get(editor) ?? false,
      root: () => undefined,
    }),
  } satisfies EditorCoreStateView<V>;

  const stateRecord = coreState as unknown as Record<string, unknown>;

  stateRecord.transaction = Object.assign(
    (fn: (transaction: EditorTransactionSpecBuilder<V, TExtensions>) => void) =>
      createTransactionSpec(editor, fn),
    {
      extend: (
        base: TransactionSpec,
        fn: (transaction: EditorTransactionSpecBuilder<V, TExtensions>) => void
      ) => extendTransactionSpec(editor, base, fn),
    }
  );

  for (const [groupName, registration] of getExtensionRegistry(editor)
    .stateGroups) {
    stateRecord[groupName] = registration.factory(
      stateRecord as never,
      editor as never
    );
  }

  state = Object.freeze(stateRecord) as EditorStateView<V, TExtensions>;

  return state;
};

/** @internal Read the full state view without suspending an active draft. */
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
  const transactionSnapshot = getTransactionSnapshot(editor);
  const transactionRoot = getCurrentChildrenRoot(editor);

  return Object.freeze({
    afterCommit(handler) {
      const snapshot = getTransactionSnapshot(editor);

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

const assertActiveTransaction = (editor: Editor, token: TransactionToken) => {
  if (
    !token.active ||
    getTransactionSnapshot(editor)?.token !== token ||
    !isInTransaction(editor)
  ) {
    throw new Error('editor transaction is no longer active');
  }
};

const guardTransactionValue = (
  value: unknown,
  assertActive: () => void,
  cache: WeakMap<object, object>
): unknown => {
  if (
    (typeof value !== 'object' || value === null) &&
    typeof value !== 'function'
  ) {
    return value;
  }

  const objectValue = value as object;
  const existing = cache.get(objectValue);

  if (existing) {
    return existing;
  }

  const proxyTarget =
    typeof objectValue === 'function' ? () => {} : Object.create(null);
  const guarded = new Proxy(proxyTarget, {
    apply(_target, thisArg, args) {
      assertActive();

      return Reflect.apply(
        objectValue as (...args: unknown[]) => unknown,
        thisArg,
        args
      );
    },
    get(_target, property) {
      return guardTransactionValue(
        Reflect.get(objectValue, property, objectValue),
        assertActive,
        cache
      );
    },
    has(_target, property) {
      return Reflect.has(objectValue, property);
    },
  });

  cache.set(objectValue, guarded);

  return guarded;
};

const getSpecSafeTransactionGroup = (value: unknown): unknown => {
  if (typeof value !== 'object' || value === null) return value;

  return Object.freeze(
    Object.fromEntries(
      Object.entries(value).filter(([, member]) => !isTxOnlyMethod(member))
    )
  );
};

const getUpdateView = <
  V extends Value,
  TExtensions extends readonly unknown[] = readonly [],
>(
  editor: Editor<V, TExtensions>
): EditorUpdateTransaction<V, TExtensions> => {
  const transactionSnapshot = getTransactionSnapshot(editor);

  if (!transactionSnapshot) {
    throw new Error('editor transaction is no longer active');
  }

  const token = transactionSnapshot.token;
  const specContext = getTransactionSpecContext(editor);
  const existing = specContext?.updateView;

  if (existing?.token === token) {
    return existing.view as unknown as EditorUpdateTransaction<V, TExtensions>;
  }

  const assertActive = () => assertActiveTransaction(editor, token);
  const runActive = <T>(fn: () => T): T => {
    assertActive();

    return fn();
  };
  const state = getStateView(editor);
  const runMutation = <T>(
    options: { at?: Location } | undefined,
    fn: () => T
  ) => {
    assertActive();

    return runWithMutationRoot(editor, getMutationRoot(editor, options), fn);
  };
  const runTargetMutation = <TOptions extends NodeTargetOptions, TResult>(
    options: TOptions | undefined,
    fn: (options: ResolvedNodeTargetOptions<TOptions> | undefined) => TResult
  ): TResult | undefined => {
    assertActive();

    const resolvedOptions = resolveNodeTargetOptions(editor, options);

    if (resolvedOptions === null) return;

    const root =
      getNodeTargetRoot(options?.at) ??
      getMutationRoot(editor, resolvedOptions);
    const localOptions =
      resolvedOptions?.at === undefined
        ? resolvedOptions
        : ({
            ...resolvedOptions,
            at: localizeLocation(resolvedOptions.at),
          } as ResolvedNodeTargetOptions<TOptions>);

    return runWithMutationRoot(editor, root, () => fn(localOptions));
  };
  const runSelectionMutation = <T>(fn: () => T) => {
    assertActive();

    return runWithMutationRoot(editor, getMutationRoot(editor), fn);
  };
  const markSelectionWritten = <T>(fn: () => T) => {
    const context = getTransactionSpecContext(editor);

    if (context) context.selectionWritten = true;

    return fn();
  };
  const runSelectionWrite = <T>(fn: () => T) =>
    runSelectionMutation(() => markSelectionWritten(fn));
  const runLocationMutation = <T>(location: Location, fn: () => T) => {
    assertActive();

    return runWithMutationRoot(
      editor,
      getLocationMutationRoot(editor, location),
      fn
    );
  };
  const toggleBlock = defineSemanticUpdateMethod<
    EditorTransactionBlocksApi<V>['toggle']
  >(
    (
      type,
      {
        at = getCurrentSelection(editor) ?? undefined,
        defaultType = getEditorDefaultBlockType(editor),
        someOptions,
        wrap,
        ...options
      } = {}
    ) => {
      if (!at) return;
      const targetAt = resolveNodeTargetLocation(editor, at);

      if (!targetAt) return;
      const someMatch = normalizeNodeMatch(someOptions?.match);

      const typeMatch = (node: PliteNode, path: Path) =>
        NodeApi.isElement(node) &&
        node.type === type &&
        (someMatch?.(node, path) ?? true);
      const isActive = state.nodes.some({
        ...someOptions,
        at: targetAt,
        match: typeMatch,
      });

      if (wrap) {
        if (isActive) {
          runMutation({ at: targetAt }, () =>
            unwrapNodes(editor, {
              at: targetAt,
              match: typeMatch,
              ...options,
            })
          );
        } else {
          runMutation({ at: targetAt }, () =>
            wrapNodes(editor, { children: [], type } as ElementIn<V>, {
              at: targetAt,
              ...options,
            })
          );
        }

        return;
      }

      if (isActive && type === defaultType) return;

      runMutation({ at: targetAt }, () =>
        txRecord.nodes.set(
          { type: isActive ? defaultType : type },
          { at: targetAt, ...options }
        )
      );
    },
    (command, [blockType, options]) => {
      command(editorCommands.toggleBlock, { blockType, options });
    }
  );
  const resetBlock: EditorTransactionBlocksApi<V>['reset'] = (
    props,
    { preserve = [], ...options } = {}
  ) => {
    const resolvedOptions = resolveNodeTargetOptions(editor, options);

    if (resolvedOptions === null) return;

    const nextOptions = resolvedOptions ?? {};
    const match = normalizeNodeMatch(nextOptions.match);
    const exactEntry =
      nextOptions.at && LocationApi.isPath(nextOptions.at)
        ? state.nodes.get(nextOptions.at)
        : undefined;
    const entry =
      exactEntry &&
      NodeApi.isElement(exactEntry[0]) &&
      state.schema.isBlock(exactEntry[0]) &&
      (match?.(exactEntry[0], exactEntry[1]) ?? true)
        ? exactEntry
        : state.nodes.block(nextOptions);

    if (!entry) return;

    const [block, path] = entry;
    const preserved = new Set(preserve);
    const nextProps = props as Record<string, unknown>;
    const propsToUnset = Object.keys(NodeApi.extractProps(block)).filter(
      (key) => !preserved.has(key) && !(key in nextProps)
    );

    runMutation({ at: path }, () => {
      for (const key of propsToUnset) {
        unsetNodes(editor, key, { at: path });
      }

      setNodes(editor, props, { at: path });
    });
  };
  let txRecord!: EditorUpdateTransaction<V, TExtensions>;
  const duplicateNodes: EditorTransactionNodesApi<V>['duplicate'] = (
    entries,
    options = {}
  ) => {
    if (entries.length === 0) return;

    const lastEntry = entries.at(-1)!;
    const insertPath = PathApi.next(lastEntry[1]);
    const roots: Record<string, readonly Descendant[]> = {};
    const visited = new Set<string>();
    const document = getActiveDocumentChangeBuilder(editor)
      .value as EditorDocumentValue;
    const collect = (nodes: readonly Descendant[]) => {
      for (const node of nodes) {
        if (!NodeApi.isElement(node)) continue;

        for (const { root } of getEditorSchema(editor).getElementOwnedRoots(
          node
        )) {
          if (visited.has(root)) continue;
          const children = document.roots?.[root];

          if (!children) continue;
          visited.add(root);
          roots[root] = children;
          collect(children);
        }
        collect(node.children);
      }
    };
    const source = entries.map(([node]) => node as Descendant);

    collect(source);
    const slice = remapContentSliceRoots(
      editor,
      ContentSlice.fromJSON({
        content: source,
        openEnd: 0,
        openStart: 0,
        ...(Object.keys(roots).length > 0 ? { roots } : {}),
      })
    );

    txRecord.nodes.insert([...slice.content] as ElementOrTextIn<V>[], {
      ...options,
      at: insertPath,
    });
    materializeContentSliceRoots(editor, slice);
  };
  const duplicateBlocks: EditorTransactionBlocksApi<V>['duplicate'] = ({
    at = state.selection() ?? undefined,
    hanging,
    match,
    mode,
    select,
    voids,
  } = {}) => {
    if (!at) return;
    const targetAt = resolveNodeTargetLocation(editor, at);

    if (!targetAt) return;

    const blockMatch = normalizeNodeMatch(match);

    const matchesBlock = (node: PliteNode, path: Path) =>
      NodeApi.isElement(node) &&
      state.schema.isBlock(node) &&
      (!blockMatch || blockMatch(node, path));
    const entries = LocationApi.isRange(targetAt)
      ? state.nodes.toArray<ElementIn<V>>({
          at: targetAt,
          match: matchesBlock,
          mode,
          voids,
        })
      : (() => {
          const entry = state.nodes.block<ElementIn<V>>({ at: targetAt });

          return entry && matchesBlock(entry[0], entry[1]) ? [entry] : [];
        })();

    txRecord.nodes.duplicate(entries, {
      hanging,
      select,
      voids,
    });
  };
  const insertBlocksAfter: EditorTransactionBlocksApi<V>['insertAfter'] = (
    nodes,
    { at = state.selection() ?? undefined, ...options } = {}
  ) => {
    if (!at) {
      txRecord.nodes.insert(nodes, options);
      return;
    }

    const targetAt = resolveNodeTargetLocation(editor, at);

    if (!targetAt) return;

    const target = LocationApi.isRange(targetAt)
      ? state.points.end(targetAt)
      : targetAt;

    if (!target) return;

    const exactEntry = LocationApi.isPath(target)
      ? state.nodes.get<ElementIn<V>>(target)
      : undefined;
    const block =
      exactEntry &&
      NodeApi.isElement(exactEntry[0]) &&
      state.schema.isBlock(exactEntry[0])
        ? exactEntry
        : state.nodes.block<ElementIn<V>>({ at: target });

    if (!block) return;

    txRecord.nodes.insert(nodes, {
      ...options,
      at: PathApi.next(block[1]),
    });
  };
  const setTransactionNodes = defineSemanticUpdateMethod<
    EditorTransactionNodesApi<V>['set']
  >(
    (...args) => {
      const [props, options] = args;
      return runTargetMutation(options, (resolvedOptions) =>
        setNodes(editor, props, resolvedOptions)
      );
    },
    (command, [props, options]) => {
      command(editorCommands.setNodes, { options, props });
    }
  );
  const discardReplacedRuntimeIdentities = (root: string, path: Path) => {
    const snapshot = getTransactionSnapshot(editor);

    if (!snapshot) return;

    const owner = getEditorRuntimeOwner(editor);
    const currentIndex = getTransactionSnapshotIndex(owner, snapshot, root);

    for (const [runtimeId, currentPath] of currentIndex.entries()) {
      if (
        currentPath.length >= path.length &&
        path.every((part, index) => currentPath[index] === part)
      ) {
        snapshot.discardedRuntimeIds.add(runtimeId as RuntimeId);
      }
    }
  };
  const replaceNode: EditorTransactionNodesApi<V>['replace'] = (
    nodes,
    options
  ) => {
    const at = resolveNodeTargetLocation(editor, options.at);

    if (!at || !LocationApi.isPath(at)) return;

    return runMutation({ at }, () => {
      if (at.length === 0) {
        throw new Error('Cannot replace the editor root.');
      }

      NodeApi.get(editor, at);
      discardReplacedRuntimeIdentities(
        getActiveUpdateRoot(editor) ?? MAIN_ROOT_KEY,
        at
      );

      const replacements = Array.isArray(nodes) ? nodes : [nodes];
      const parentPath = PathApi.parent(at);
      const index = at.at(-1)!;
      const newSelection =
        options.select && replacements.length > 0
          ? (() => {
              const lastNode = replacements.at(-1)!;
              const [lastText, relativePath] = NodeApi.last(lastNode, []);

              if (!NodeApi.isText(lastText)) {
                throw new Error('Cannot select a replacement with no text.');
              }

              const point = {
                offset: lastText.text.length,
                path: [
                  ...parentPath,
                  index + replacements.length - 1,
                  ...relativePath,
                ],
              };

              return SelectionApi.text({ anchor: point, focus: point });
            })()
          : undefined;

      return replaceChildren(editor, replacements, {
        at: parentPath,
        count: 1,
        index,
        newSelection,
      });
    });
  };
  const replaceChildrenNodes: EditorTransactionNodesApi<V>['replaceChildren'] =
    (children, options) => {
      const at = resolveNodeTargetLocation(editor, options.at);

      if (!at || !LocationApi.isPath(at)) return;

      return runMutation({ at }, () =>
        replaceChildren(editor, children, { ...options, at })
      );
    };

  const tx: EditorCoreUpdateTransaction<V> = {
    ...state,
    anchor: (value, options) => runActive(() => editor.anchor(value, options)),
    annotations: Object.freeze({
      get: <TValue>(annotation: EditorUpdateAnnotation<TValue>) =>
        runActive(
          () =>
            getTransactionSnapshot(editor)?.annotations.get(annotation.key)
              ?.value as TValue | undefined
        ),
      set: <TValue>(
        annotation: EditorUpdateAnnotation<TValue>,
        value: TValue
      ) =>
        runActive(() => {
          const snapshot = getTransactionSnapshot(editor);

          if (!snapshot) {
            throw new Error(
              'tx.annotations.set can only run during editor.update'
            );
          }

          const previous = snapshot.annotations.get(annotation.key)?.value as
            | TValue
            | undefined;
          snapshot.annotations.set(annotation.key, {
            type: annotation,
            value:
              previous === undefined
                ? cloneValue(value)
                : cloneValue(annotation.combine(previous, value)),
          });
          markTransactionChanged(editor);
        }),
    }),
    blocks: Object.freeze({
      duplicate: duplicateBlocks,
      insertAfter: insertBlocksAfter,
      lift: (options) =>
        runTargetMutation(options, (resolvedOptions) =>
          liftNodes(editor, resolvedOptions)
        ),
      reset: resetBlock,
      toggle: toggleBlock,
    }),
    break: Object.freeze({
      insert: defineSemanticUpdateMethod<EditorTransactionBreakApi['insert']>(
        () => runSelectionMutation(() => applyInsertBreak(editor)),
        (command) => {
          command(editorCommands.insertBreak);
        }
      ),
      insertSoft: defineSemanticUpdateMethod<
        EditorTransactionBreakApi['insertSoft']
      >(
        () => runSelectionMutation(() => applyInsertSoftBreak(editor)),
        (command) => {
          command(editorCommands.insertSoftBreak);
        }
      ),
    }),
    changes: Object.freeze({
      apply: (change: DocumentChange) =>
        runActive(() => applyDocumentChange(editor, change)),
    }),
    effects: Object.freeze({
      all: () => runActive(() => getTransactionSnapshot(editor)?.effects ?? []),
      emit: <TValue>(type: EditorEffectType<TValue>, value: TValue) =>
        runActive(() => emitEditorEffect(editor, type, value)),
    }),
    extensions: Object.freeze({
      reconfigure: (slot, input, options) =>
        runActive(() =>
          stageEditorExtensionConfiguration(
            editor,
            slot.key,
            slot.of(input),
            undefined,
            undefined,
            options
          )
        ),
    }),
    fragment: Object.freeze(
      Object.assign(
        (...args: Parameters<typeof state.fragment>) => state.fragment(...args),
        {
          delete: defineSemanticUpdateMethod<
            EditorTransactionFragmentApi<V>['delete']
          >(
            (options) =>
              runTargetMutation(options, (resolvedOptions) =>
                applyDeleteFragment(editor, resolvedOptions)
              ),
            (command, [options = {}]) => {
              command(editorCommands.deleteFragment, {
                at: options.at,
                direction: options.direction ?? 'forward',
              });
            }
          ),
          replace: defineSemanticUpdateMethod<
            EditorTransactionFragmentApi<V>['replace']
          >(
            (content, options) =>
              tx.slice.replace(ContentSlice.closed<V>(content), options),
            (command, [content, options]) =>
              command(editorCommands.replaceSlice, {
                options,
                slice: ContentSlice.closed(content),
              })
          ),
        }
      )
    ),
    marks: Object.freeze(
      Object.assign((() => state.marks()) satisfies EditorStateMarksApi<V>, {
        add: defineSemanticUpdateMethod<EditorTransactionMarksApi<V>['add']>(
          (key, value) =>
            runSelectionMutation(() => applyAddMark(editor, key, value)),
          (command, [key, value]) => {
            command(editorCommands.addMark, { key, value });
          }
        ),
        remove: defineSemanticUpdateMethod<
          EditorTransactionMarksApi<V>['remove']
        >(
          (key) => runSelectionMutation(() => applyRemoveMark(editor, key)),
          (command, [key]) => {
            command(editorCommands.removeMark, { key });
          }
        ),
        set: (marks: EditorMarks<V> | null) =>
          runSelectionMutation(() => setCurrentMarks(editor, marks)),
        toggle: defineSemanticUpdateMethod<
          EditorTransactionMarksApi<V>['toggle']
        >(
          (key, value) => {
            const nextValue = value === undefined ? true : value;

            runSelectionMutation(() => applyToggleMark(editor, key, nextValue));
          },
          (command, [key, value = true]) => {
            command(editorCommands.toggleMark, { key, value });
          }
        ),
      })
    ),
    nodes: Object.freeze({
      ...state.nodes,
      duplicate: duplicateNodes,
      insert: defineSemanticUpdateMethod<
        EditorTransactionNodesApi<V>['insert']
      >(
        (nodes, options) =>
          runTargetMutation(options, (resolvedOptions) => {
            const limited = limitNodeInsert(editor, nodes, resolvedOptions);

            if (!limited || (Array.isArray(limited) && limited.length === 0)) {
              return;
            }

            insertNodes(editor, limited, resolvedOptions);
          }),
        (command, [nodes, options]) => {
          command(editorCommands.insertNodes, { nodes, options });
        }
      ),
      lift: (options) =>
        runTargetMutation(options, (resolvedOptions) =>
          liftNodes(editor, resolvedOptions)
        ),
      merge: (options) =>
        runTargetMutation(options, (resolvedOptions) =>
          mergeNodes(editor, resolvedOptions)
        ),
      move: (options) =>
        runTargetMutation(options, (resolvedOptions) =>
          moveNodes(editor, resolvedOptions!)
        ),
      remove: defineSemanticUpdateMethod<
        EditorTransactionNodesApi<V>['remove']
      >(
        (options) =>
          runTargetMutation(options, (resolvedOptions) =>
            removeNodes(editor, resolvedOptions)
          ),
        (command, [options]) => {
          command(editorCommands.removeNodes, { options });
        }
      ),
      replace: replaceNode,
      replaceChildren: replaceChildrenNodes,
      set: setTransactionNodes,
      split: (options) =>
        runTargetMutation(options, (resolvedOptions) =>
          splitNodes(editor, resolvedOptions)
        ),
      toggle: toggleBlock,
      unset: (props, options) =>
        runTargetMutation(options, (resolvedOptions) =>
          unsetNodes(editor, props, resolvedOptions)
        ),
      unwrap: (options) =>
        runTargetMutation(options, (resolvedOptions) =>
          unwrapNodes(editor, resolvedOptions)
        ),
      wrap: (element, options) =>
        runTargetMutation(options, (resolvedOptions) =>
          wrapNodes(editor, element, resolvedOptions)
        ),
    }),
    refs: Object.freeze({
      path: (path: Path, options: AnchorOptions<Path>) =>
        runActive(() => {
          const anchor = editor.anchor(path, options);

          transactionSnapshot.draftRefs.add(anchor);

          return Object.freeze({
            resolve: () => {
              assertActive();

              return anchor.resolve();
            },
          });
        }),
      point: (point: Point, options: AnchorOptions<Point>) =>
        runActive(() => {
          const anchor = editor.anchor(point, options);

          transactionSnapshot.draftRefs.add(anchor);

          return Object.freeze({
            resolve: () => {
              assertActive();

              return anchor.resolve();
            },
          });
        }),
    }),
    roots: Object.freeze({
      create: (root, children) =>
        runActive(() => {
          requireMutableRoot(root);
          const roots = getEditorDocumentRoots(editor);

          if (Object.hasOwn(roots, root)) {
            throw new Error(`Cannot create existing editor root "${root}".`);
          }

          applyTransactionSpec(
            editor,
            createRootFitTransactionSpec(
              editor,
              root,
              ContentSlice.closed(children)
            )
          );
        }),
      delete: (root) =>
        runActive(() => {
          requireMutableRoot(root);
          const roots = getEditorDocumentRoots(editor);
          const children = roots[root];

          if (!Object.hasOwn(roots, root) || children === undefined) {
            throw new Error(`Cannot delete missing editor root "${root}".`);
          }

          applyDocumentChangeStep(
            editor,
            getActiveDocumentChangeBuilder(editor).deleteRoot(root)
          );
        }),
      replace: (root, children) =>
        runActive(() => {
          requireMutableRoot(root);
          const roots = getEditorDocumentRoots(editor);
          const previousChildren = roots[root];

          if (!Object.hasOwn(roots, root) || previousChildren === undefined) {
            throw new Error(`Cannot replace missing editor root "${root}".`);
          }

          applyTransactionSpec(
            editor,
            createRootFitTransactionSpec(
              editor,
              root,
              ContentSlice.closed(children)
            )
          );
        }),
    }),
    slice: Object.freeze({
      get: (options) => state.slice.get(options),
      replace: defineSemanticUpdateMethod<
        EditorTransactionSliceApi<V>['replace']
      >(
        (slice, options) =>
          runActive(() => {
            const spec = createSliceFitTransactionSpec(editor, slice, options);

            if (!spec) return false;

            applyTransactionSpec(editor, spec);

            return true;
          }),
        (command, [slice, options]) =>
          command(editorCommands.replaceSlice, { options, slice })
      ),
    }),
    tags: Object.freeze({
      add: (tag: EditorUpdateTag) =>
        runActive(() => {
          const snapshot = getTransactionSnapshot(editor);

          if (!snapshot) {
            throw new Error('tx.tags.add can only run during editor.update');
          }

          applyEditorUpdateTag(snapshot.tags, tag);
        }),
      has: (tag: EditorUpdateTag) =>
        runActive(() => getTransactionSnapshot(editor)?.tags.has(tag) ?? false),
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
        clear: () => runSelectionWrite(() => deselect(editor)),
        collapse: defineSemanticUpdateMethod<
          EditorTransactionSelectionApi['collapse']
        >(
          (options = {}) =>
            runSelectionWrite(() => collapseSelection(editor, options)),
          (command, [options]) => {
            command(editorCommands.collapse, { options });
          }
        ),
        move: defineSemanticUpdateMethod<EditorTransactionSelectionApi['move']>(
          (options = {}) => runSelectionWrite(() => applyMove(editor, options)),
          (command, [options]) => {
            command(editorCommands.move, { options });
          }
        ),
        set: defineSemanticUpdateMethod<EditorTransactionSelectionApi['set']>(
          (target) => {
            if (target == null) {
              runSelectionWrite(() => deselect(editor));
              return;
            }

            if (SelectionApi.isSelection(target)) {
              markSelectionWritten(() =>
                runLocationMutation(target, () => select(editor, target))
              );
              return;
            }

            if (RangeApi.isRange(target)) {
              markSelectionWritten(() =>
                runLocationMutation(target, () => select(editor, target))
              );
              return;
            }

            markSelectionWritten(() =>
              runLocationMutation(target, () => select(editor, target))
            );
          },
          (command, [target], primitive) => {
            if (target == null) return primitive(target);

            command(editorCommands.select, { target });
          }
        ),
        setPoint: (
          ...args: Parameters<EditorTransactionSelectionApi['setPoint']>
        ) => runSelectionWrite(() => setPoint(editor, ...args)),
        setRange: defineSemanticUpdateMethod<
          EditorTransactionSelectionApi['setRange']
        >(
          (...args) => runSelectionWrite(() => setSelection(editor, ...args)),
          (command, [props]) => {
            command(editorCommands.setSelection, { props });
          }
        ),
      }) satisfies EditorTransactionSelectionApi
    ),
    setField: <TValue>(
      field: EditorStateField<TValue>,
      value: StateFieldValueInput<TValue>
    ) => runActive(() => setStateFieldValue(editor, field, value)),
    text: Object.freeze({
      ...state.text,
      delete: (options = {}) =>
        runTargetMutation(options, (resolvedOptions) =>
          deleteText(editor, resolvedOptions)
        ),
      deleteBackward: defineSemanticUpdateMethod<
        EditorTransactionTextApi['deleteBackward']
      >(
        (options = {}) =>
          runSelectionMutation(() =>
            applyDelete(editor, {
              direction: 'backward',
              unit: options.unit ?? 'character',
            })
          ),
        (command, [options = {}]) => {
          command(editorCommands.delete, {
            direction: 'backward',
            unit: options.unit ?? 'character',
          });
        }
      ),
      deleteForward: defineSemanticUpdateMethod<
        EditorTransactionTextApi['deleteForward']
      >(
        (options = {}) =>
          runSelectionMutation(() =>
            applyDelete(editor, {
              direction: 'forward',
              unit: options.unit ?? 'character',
            })
          ),
        (command, [options = {}]) => {
          command(editorCommands.delete, {
            direction: 'forward',
            unit: options.unit ?? 'character',
          });
        }
      ),
      insert: defineSemanticUpdateMethod<EditorTransactionTextApi['insert']>(
        (text, options = {}) =>
          runTargetMutation(options, (resolvedOptions) => {
            const limited = limitTextInsert(editor, text, resolvedOptions);

            if (limited.length === 0 && text.length > 0) return;

            applyInsertTextCommand(editor, limited, resolvedOptions);
          }),
        (command, [text, options]) => {
          command(editorCommands.insertText, { options, text });
        }
      ),
    }),
    value: Object.freeze(
      Object.assign(() => state.value(), {
        replace: (input: SnapshotInput<V>) =>
          runActive(() => replaceSnapshot(editor, input)),
      })
    ),
  };

  txRecord = tx as unknown as EditorUpdateTransaction<V, TExtensions>;
  const txExtensionRecord = txRecord as unknown as Record<string, unknown>;

  if (specContext?.kind === 'update') {
    txExtensionRecord.command = ((
      command: EditorCommand<unknown>,
      input?: unknown
    ) =>
      runActive(() =>
        getEditorRuntime(editor).runCommand(command, input)
      )) as EditorCommandDispatch;
  }

  for (const [groupName, registration] of getExtensionRegistry(editor)
    .txGroups) {
    const group = registration.factory(
      txExtensionRecord as never,
      editor as never,
      (specContext?.kind === 'update'
        ? getUpdateContext(editor)
        : Object.freeze({
            afterCommit() {
              throw new Error(
                'afterCommit is unavailable while building a transaction spec.'
              );
            },
          })) as never
    );

    txExtensionRecord[groupName] = guardTransactionValue(
      specContext?.kind === 'spec' ? getSpecSafeTransactionGroup(group) : group,
      assertActive,
      new WeakMap()
    );
  }

  const view = Object.freeze(txRecord) as EditorUpdateTransaction<
    V,
    TExtensions
  >;
  if (!specContext) {
    throw new Error('Missing editor transaction draft.');
  }
  specContext.updateView = { token, view };
  return view;
};

export const getActiveUpdateView = <
  V extends Value,
  TExtensions extends readonly unknown[] = readonly [],
>(
  editor: Editor<V, TExtensions>
): EditorUpdateTransaction<V, TExtensions> => {
  if (!isInTransaction(editor)) {
    throw new Error(
      'The active transaction is only available during editor.update'
    );
  }

  return getUpdateView(editor);
};

export const getActiveEditorTransaction = <
  V extends Value,
  TExtensions extends readonly unknown[] = readonly [],
>(
  editor: Editor<V, TExtensions>
): EditorUpdateTransaction<V, TExtensions> | null => {
  const owner = getEditorRuntimeOwner(editor) as Editor<V, TExtensions>;

  return isInTransaction(owner) ? getUpdateView(owner) : null;
};

/** @internal Whether writes currently target an immutable detached spec. */
export const isBuildingTransactionSpec = (editor: Editor) =>
  getTransactionSpecContext(editor)?.kind === 'spec';

const createTransactionSpecContext = (editor: Editor) => {
  const parent = getTransactionSpecContext(editor);
  const parentSnapshot = getTransactionSnapshot(editor);
  const activeChildrenRoot = getEditorChildrenRoot(editor);
  const activeUpdateRoot = getActiveUpdateRoot(editor);
  const anchorValue = getEditorDocumentValue(editor);
  const roots = getEditorDocumentRoots(editor);
  const selection = getCurrentSelection(editor);
  const selectionRoot = getCurrentSelectionRoot(editor);
  const currentChildrenRoot = getCurrentChildrenRoot(editor);
  const baseRuntimeIndex = parentSnapshot
    ? () =>
        getTransactionSnapshotIndex(editor, parentSnapshot, currentChildrenRoot)
    : (() => {
        const baseSnapshot = getSnapshot(editor);

        return () => baseSnapshot.index;
      })();
  const builder = parentSnapshot
    ? parentSnapshot.builder.fork({ validation: 'defer-to-parent' })
    : createEditorDocumentChangeBuilder(editor, getChangeValue(roots));
  const token = { active: true };
  const snapshot: TransactionSnapshot = {
    activeChange: { change: builder.change },
    afterCommitHandlers: [],
    annotations: new Map(),
    baseRuntimeIndexes: { [currentChildrenRoot]: baseRuntimeIndex },
    baseSnapshots: {},
    builder,
    childrenRoot: getCurrentChildrenRoot(editor),
    contentSliceRoots: new Set(),
    dirtyStateKeys: new Set(),
    documentState: copyDocumentState(getDocumentState(editor)),
    discardedRuntimeIds: new Set(),
    draftRefs: new Set(),
    effects: [],
    extensionReconfigurations: new Map(),
    facet: createEditorFacetDraft(
      editor,
      getSnapshotVersion(editor),
      parentSnapshot?.facet
    ),
    implicitTarget: parentSnapshot?.implicitTargetResolved
      ? cloneValue(parentSnapshot.implicitTarget)
      : null,
    implicitTargetResolved: parentSnapshot?.implicitTargetResolved ?? false,
    previousSnapshot: null,
    previousVersion: getSnapshotVersion(editor),
    protectedInlineSpacerPaths: new Map(
      parentSnapshot?.protectedInlineSpacerPaths
    ),
    reason: null,
    rootIndexes: {},
    roots,
    runtimeIndexRollbacks: new Map(),
    selection,
    selectionRoot,
    skipCorrections: true,
    tags: new Set(),
    transactionChangeObservers: new Set(),
    token,
  };
  const context: TransactionSpecContext = {
    ...(activeChildrenRoot ? { activeChildrenRoot } : {}),
    ...(activeUpdateRoot ? { activeUpdateRoot } : {}),
    baseDraftEpoch: parent?.draftEpoch ?? 0,
    baseRevision: getMutationVersion(editor),
    changed: false,
    currentChildrenRoot,
    depth: 1,
    documentState: copyDocumentState(getDocumentState(editor)),
    draftEpoch: parent?.draftEpoch ?? 0,
    exitAnchorScope: () => {},
    id: {},
    kind: 'spec',
    mutationVersion: getMutationVersion(editor),
    ...(parent ? { parentId: parent.id } : {}),
    selection,
    selectionRoot,
    selectionWritten: false,
    snapshot,
  };
  const contexts = TRANSACTION_SPEC_CONTEXTS.get(editor) ?? [];

  contexts.push(context);
  TRANSACTION_SPEC_CONTEXTS.set(editor, contexts);
  try {
    context.exitAnchorScope = enterAnchorScope(editor, anchorValue);
  } catch (error) {
    contexts.pop();
    if (contexts.length === 0) TRANSACTION_SPEC_CONTEXTS.delete(editor);
    throw error;
  }

  return context;
};

const disposeTransactionSpecContext = (
  editor: Editor,
  context: TransactionSpecContext
) => {
  closeTransactionDraftRefs(context.snapshot);
  const contexts = TRANSACTION_SPEC_CONTEXTS.get(editor);

  if (contexts?.at(-1) !== context) {
    throw new Error('Transaction spec contexts must close in stack order.');
  }

  context.exitAnchorScope();
  contexts.pop();
  if (contexts.length === 0) TRANSACTION_SPEC_CONTEXTS.delete(editor);
};

const assertTransactionSpecBase = (editor: Editor, spec: TransactionSpec) => {
  if (
    spec.kind !== 'transaction' ||
    !(spec.changes instanceof DocumentChange)
  ) {
    throw new Error('Invalid transaction spec.');
  }

  const base = TRANSACTION_SPEC_BASE.get(spec);

  if (!base) {
    throw new Error('Transaction spec is missing its opaque base.');
  }
  if (base.editor !== editor) {
    throw new Error('Cannot apply a transaction spec to a different editor.');
  }
  const context = getTransactionSpecContext(editor);
  const validContext =
    base.context === context?.id ||
    (context?.kind === 'update' && base.context === undefined);

  if (!validContext && (base.context !== undefined || context !== undefined)) {
    throw new Error('Cannot apply a transaction spec outside its base state.');
  }
  if (base.revision !== getMutationVersion(editor)) {
    throw new Error('Cannot apply a stale transaction spec.');
  }
};

/** @internal Publish the canonical representation of the active draft. */
export const finalizeTransactionRepresentation = (editor: Editor) => {
  const snapshot = getTransactionSnapshot(editor);

  if (!snapshot) {
    throw new Error('Missing transaction draft for canonical construction.');
  }

  const step = profileCoreDuration('transaction-finalize-representation', () =>
    snapshot.builder.finalize()
  );

  if (step) {
    applyTransactionSpecDocumentChangeStep(editor, step, {
      selectionMapping: 'representation',
    });
  }

  return step;
};

const reconcileExclusiveElementOwnedRoots = (editor: Editor) => {
  const snapshot = getTransactionSnapshot(editor);

  if (!snapshot) return false;
  const schema = getEditorSchema(editor);
  const before = getChangeValue(snapshot.roots) as EditorDocumentValue;
  const after = snapshot.builder.value as EditorDocumentValue;
  const change = snapshot.builder.change;
  const candidates = schema.getOrphanedElementOwnedRoots({
    after,
    before,
    change,
    indexedAfter: snapshot.builder.indexedAfter(change),
    tracked: snapshot.contentSliceRoots,
  });

  let changed = false;

  for (const root of candidates) {
    applyDocumentChangeStep(editor, snapshot.builder.deleteRoot(root));
    snapshot.contentSliceRoots.delete(root);
    changed = true;

    if (getCurrentSelectionRoot(editor) === root) {
      setCurrentSelection(editor, null, MAIN_ROOT_KEY);
    }
  }

  return changed;
};

const finalizeTransactionSpecContext = (
  editor: Editor,
  context: TransactionSpecContext
): TransactionSpec => {
  finalizeTransactionRepresentation(editor);

  const { snapshot } = context;

  if (snapshot.extensionReconfigurations.size > 0) {
    throw new Error('Transaction specs cannot reconfigure editor extensions.');
  }

  const stateChanged = !areEditorJsonValuesEqual(
    snapshot.documentState,
    getDocumentState(editor)
  );

  if (
    stateChanged &&
    snapshot.effects.length === 0 &&
    snapshot.reason !== 'replace'
  ) {
    throw new Error(
      'Transaction spec state changes must be represented by typed effects.'
    );
  }

  const selectionAfter = getCurrentSelection(editor);
  const selectionAfterRoot = getCurrentSelectionRoot(editor);
  const selectionChanged =
    context.selectionWritten ||
    selectionAfterRoot !== snapshot.selectionRoot ||
    !areEditorJsonValuesEqual(selectionAfter, snapshot.selection);
  const changes = snapshot.builder.change;
  const spec = Object.freeze({
    annotations: Object.freeze(
      [...snapshot.annotations.values()].map((entry) =>
        Object.freeze({
          type: entry.type,
          value: cloneFrozen(entry.value),
        })
      )
    ),
    changes,
    effects: Object.freeze([...snapshot.effects]),
    kind: 'transaction' as const,
    ...(selectionChanged
      ? {
          selection: Object.freeze({
            ...(toPublicRoot(selectionAfterRoot)
              ? { root: toPublicRoot(selectionAfterRoot) }
              : {}),
            value: cloneFrozenEditorJsonValue(selectionAfter),
          }),
        }
      : {}),
    tags: Object.freeze([...snapshot.tags]),
  }) as TransactionSpec;

  TRANSACTION_SPEC_BASE.set(spec, {
    ...(context.parentId ? { context: context.parentId } : {}),
    draftEpoch: context.baseDraftEpoch,
    editor,
    revision: context.baseRevision,
  });
  if (snapshot.reason === 'replace') {
    TRANSACTION_SPEC_DOCUMENT_STATES.set(
      spec,
      copyDocumentState(getDocumentState(editor))
    );
  }
  if (snapshot.contentSliceRoots.size > 0) {
    TRANSACTION_SPEC_CONTENT_SLICE_ROOTS.set(
      spec,
      Object.freeze([...snapshot.contentSliceRoots])
    );
  }
  PREPARED_TRANSACTION_SPECS.set(
    spec,
    Object.freeze({
      deferValidation: context.parentId !== undefined,
      discardedRuntimeIds: new Set(snapshot.discardedRuntimeIds),
      document: snapshot.builder.prepare(changes, { classify: false }),
    })
  );

  return spec;
};

/** @internal Whether a value is an opaque spec minted by this runtime. */
export const isTransactionSpec = (value: unknown): value is TransactionSpec =>
  typeof value === 'object' &&
  value !== null &&
  TRANSACTION_SPEC_BASE.has(value as TransactionSpec);

/** @internal Materialize one detached spec as the full persisted document. */
export const applyTransactionSpecToDocument = (
  editor: Editor,
  spec: TransactionSpec,
  value: EditorDocumentValue
): EditorDocumentValue => {
  const document = spec.changes.apply(value) as EditorDocumentValue;

  if (!TRANSACTION_SPEC_DOCUMENT_STATES.has(spec)) return document;

  return createEditorDocumentValue({
    children: document.children,
    fields: getStateFieldIdentityMap(editor),
    meta: TRANSACTION_SPEC_DOCUMENT_STATES.get(spec),
    roots: {
      [MAIN_ROOT_KEY]: document.children,
      ...(document.roots ?? {}),
    },
  });
};

const applyPreparedTransactionSpecChange = (
  editor: Editor,
  spec: TransactionSpec,
  options: ApplyDocumentChangeOptions
) => {
  const prepared = PREPARED_TRANSACTION_SPECS.get(spec);
  const snapshot = getTransactionSnapshot(editor);
  const context = getTransactionSpecContext(editor);
  const base = TRANSACTION_SPEC_BASE.get(spec);

  if (
    !prepared ||
    !snapshot ||
    !context ||
    !base ||
    base.draftEpoch !== context.draftEpoch
  ) {
    return false;
  }

  const step = profileCoreDuration('transaction-spec-adopt', () =>
    snapshot.builder.adopt(prepared.document)
  );

  if (!step) return false;

  if (prepared.deferValidation) snapshot.builder.requireValidation();

  for (const runtimeId of prepared.discardedRuntimeIds) {
    snapshot.discardedRuntimeIds.add(runtimeId);
  }

  applyTransactionSpecDocumentChangeStep(editor, step, options);

  return true;
};

const applyTransactionSpecContents = <V extends Value>(
  editor: Editor<V>,
  spec: TransactionSpec
) => {
  const options = spec.selection
    ? {
        selectionAfter: spec.selection.value,
        selectionRoot: toInternalRoot(spec.selection.root),
      }
    : {};

  if (!spec.changes.empty) {
    if (!applyPreparedTransactionSpecChange(editor, spec, options)) {
      applyDocumentChange(editor, spec.changes, options);
    }
  } else if (spec.selection) {
    setCurrentSelection(
      editor,
      spec.selection.value,
      toInternalRoot(spec.selection.root)
    );
    syncImplicitTargetToCurrentSelection(editor);
  }

  if (spec.selection) {
    const context = getTransactionSpecContext(editor);

    if (context) context.selectionWritten = true;
  }

  if (TRANSACTION_SPEC_DOCUMENT_STATES.has(spec)) {
    const nextState = TRANSACTION_SPEC_DOCUMENT_STATES.get(spec);
    const previousState = getDocumentState(editor) ?? {};
    const next = nextState ?? {};

    for (const key of new Set([
      ...Object.keys(previousState),
      ...Object.keys(next),
    ])) {
      setStateValueByKey(editor, key, next[key]);
    }
    const snapshot = getTransactionSnapshot(editor);

    if (snapshot) snapshot.reason = 'replace';
  }
  const contentSliceRoots = TRANSACTION_SPEC_CONTENT_SLICE_ROOTS.get(spec);
  const snapshot = getTransactionSnapshot(editor);

  if (contentSliceRoots && snapshot) {
    for (const root of contentSliceRoots) snapshot.contentSliceRoots.add(root);
  }

  for (const effect of spec.effects) {
    emitEditorEffect(editor, effect.type, effect.value);
  }

  const tx = getUpdateView(editor);
  for (const annotation of spec.annotations) {
    tx.annotations.set(annotation.type, annotation.value);
  }
  for (const tag of spec.tags) {
    tx.tags.add(tag);
  }
};

const buildTransactionSpec = <
  V extends Value,
  TExtensions extends readonly unknown[],
>(
  editor: Editor<V, TExtensions>,
  fn: (transaction: EditorTransactionSpecBuilder<V, TExtensions>) => void,
  baseSpec?: TransactionSpec
): TransactionSpec => {
  if (baseSpec) assertTransactionSpecBase(editor, baseSpec);

  const context = profileCoreDuration('transaction-spec-context', () =>
    createTransactionSpecContext(editor)
  );

  try {
    if (baseSpec) applyTransactionSpecContents(editor, baseSpec);
    profileCoreDuration('transaction-spec-callback', () =>
      fn(getUpdateView(editor) as EditorTransactionSpecBuilder<V, TExtensions>)
    );

    const spec = profileCoreDuration('transaction-spec-finalize', () =>
      finalizeTransactionSpecContext(editor, context)
    );

    if (baseSpec) TRANSACTION_SPEC_PARENT.set(spec, baseSpec);

    return spec;
  } finally {
    disposeTransactionSpecContext(editor, context);
  }
};

/** @internal Whether a spec explicitly continues one delegated ancestor. */
export const isTransactionSpecContinuation = (
  candidate: TransactionSpec,
  ancestor: TransactionSpec
) => {
  let current = TRANSACTION_SPEC_PARENT.get(candidate);

  while (current) {
    if (current === ancestor) return true;

    current = TRANSACTION_SPEC_PARENT.get(current);
  }

  return false;
};

/** Build a frozen transaction spec against the current committed or draft state. */
export const createTransactionSpec = <
  V extends Value,
  TExtensions extends readonly unknown[],
>(
  editor: Editor<V, TExtensions>,
  fn: (transaction: EditorTransactionSpecBuilder<V, TExtensions>) => void
): TransactionSpec => buildTransactionSpec(editor, fn);

/** Continue a spec from the same editor revision on one isolated draft. */
export const extendTransactionSpec = <
  V extends Value,
  TExtensions extends readonly unknown[],
>(
  editor: Editor<V, TExtensions>,
  base: TransactionSpec,
  fn: (transaction: EditorTransactionSpecBuilder<V, TExtensions>) => void
): TransactionSpec => buildTransactionSpec(editor, fn, base);

/** @internal Continue command dispatch against one prepared immutable spec. */
export const continueTransactionSpec = (
  editor: Editor,
  prefix: TransactionSpec,
  run: () => false | TransactionSpec
): false | TransactionSpec => {
  assertTransactionSpecBase(editor, prefix);
  const context = createTransactionSpecContext(editor);

  try {
    applyTransactionSpecContents(editor, prefix);
    const result = run();

    if (result === false) return false;

    assertTransactionSpecBase(editor, result);
    applyTransactionSpecContents(editor, result);

    return finalizeTransactionSpecContext(editor, context);
  } finally {
    disposeTransactionSpecContext(editor, context);
  }
};

/** Apply one transaction spec inside the dispatcher's active transaction. */
export const applyTransactionSpec = <V extends Value>(
  editor: Editor<V>,
  spec: TransactionSpec
) => {
  if (!isInTransaction(editor)) {
    throw new Error('Transaction specs can only be applied during dispatch.');
  }
  assertTransactionSpecBase(editor, spec);
  applyTransactionSpecContents(editor, spec);
};

export const getCorrectionUpdateView = <
  V extends Value,
  TExtensions extends readonly unknown[] = readonly [],
>(
  editor: Editor<V, TExtensions>
): EditorCorrectionTransaction<V, TExtensions> => {
  const tx = getUpdateView(editor);
  const txRecord = tx as unknown as Record<string, unknown>;
  const installedGroups = Object.fromEntries(
    Array.from(
      getExtensionRegistry(editor).txGroups.keys(),
      (groupName) => [groupName, txRecord[groupName]] as const
    )
  );

  return Object.freeze({
    ...installedGroups,
    blocks: tx.blocks,
    break: tx.break,
    fragment: tx.fragment,
    marks: tx.marks,
    nodes: tx.nodes,
    schema: tx.schema,
    selection: tx.selection,
    tags: tx.tags,
    text: tx.text,
    value: tx.value,
  }) as EditorCorrectionTransaction<V, TExtensions>;
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
  const restoreDraft =
    (TRANSACTION_SPEC_DRAFT_READ_DEPTH.get(editor) ?? 0) === 0
      ? suspendTransactionSpecDraft(editor)
      : () => {};

  try {
    return fn(getStateView(editor));
  } finally {
    restoreDraft();
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
  options: InternalEditorUpdateOptions = {}
) => {
  if (isInTransaction(editor)) {
    throw new Error('editor.update cannot be nested inside another update');
  }

  if (getEditorReadDepth(editor) > 0) {
    throw new Error(
      'editor.update cannot be started inside editor.read outside an active update'
    );
  }

  const tags = options.tags ?? [];
  const root = getActiveUpdateRoot(editor);
  const run = () =>
    runEditorTransaction(
      editor,
      () => fn(getUpdateView(editor), getUpdateContext(editor)),
      {
        authority: 'update',
        skipCorrections: options.skipCorrections,
      }
    );

  return withUpdateTagContext(editor, tags, () =>
    root
      ? withEditorUpdateRoot(editor, root, () =>
          withEditorUpdateRootChildren(editor, root, run)
        )
      : run()
  );
};

export const runTrustedUpdate = <
  V extends Value,
  TExtensions extends readonly unknown[] = readonly [],
>(
  editor: Editor<V, TExtensions>,
  fn: (
    transaction: EditorUpdateTransaction<V, TExtensions>,
    context: EditorUpdateContext<Editor<V, TExtensions>>
  ) => void,
  options: Pick<InternalEditorUpdateOptions, 'tags'> = {}
) => {
  const owner = getEditorRuntimeOwner(editor) as Editor<V, TExtensions>;
  const snapshot = getTransactionSnapshot(owner);

  if (snapshot) {
    snapshot.skipCorrections = true;
    applyEditorUpdateTags(snapshot.tags, options.tags ?? []);
    fn(getUpdateView(owner), getUpdateContext(owner));
    return;
  }

  return getEditorRuntime(owner).update(
    (transaction, context) => {
      fn(
        transaction as EditorUpdateTransaction<V, TExtensions>,
        context as EditorUpdateContext<Editor<V, TExtensions>>
      );
    },
    { ...options, skipCorrections: true }
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
  const context = getTransactionSpecContext(editor);

  if (context) {
    if (context.currentChildrenRoot === targetRoot) return;

    const previousRoot = context.currentChildrenRoot;
    const previousActiveRoot = context.activeChildrenRoot;

    context.currentChildrenRoot = targetRoot;
    context.activeChildrenRoot = targetRoot;

    return () => {
      context.currentChildrenRoot = previousRoot;
      context.activeChildrenRoot = previousActiveRoot;
    };
  }

  const previousActiveChildrenRoot = ACTIVE_CHILDREN_ROOT.get(editor);
  const previousRoot = getCurrentChildrenRoot(editor);
  const previousChildren = getChildren(editor);
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
  };
};

export const withEditorUpdateRootChildren = <T>(
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

export const withEditorUpdateRootScope = <T>(
  editor: Editor,
  root: string | null | undefined,
  fn: () => T
): T => {
  const targetRoot = root ?? MAIN_ROOT_KEY;

  return withEditorUpdateRoot(editor, targetRoot, () =>
    withEditorUpdateRootChildren(editor, targetRoot, fn)
  );
};

export const repairEditorValue = (editor: Editor) => {
  const roots = Object.keys(getEditorDocumentRoots(editor)).sort(
    (left, right) =>
      left === MAIN_ROOT_KEY
        ? -1
        : right === MAIN_ROOT_KEY
          ? 1
          : left.localeCompare(right)
  );

  for (const root of roots) {
    withEditorUpdateRoot(editor, root, () =>
      withEditorUpdateRootChildren(editor, root, () => {
        const children = getChildren(editor);
        const canonical = canonicalizeRootChildren(
          editor,
          children,
          null,
          root
        );

        if (canonical !== children) {
          setChildren(editor, [...canonical]);
        }

        correctDocument(editor, {
          force: true,
        });
      })
    );
  }
};

export const setChildren = (
  editor: Editor,
  children: Descendant[],
  _options: { invalidateRuntimeIndex?: boolean } = {}
) => {
  const root = getCurrentChildrenRoot(editor);

  if (!getTransactionSpecContext(editor)) {
    throw new Error('Editor children can only change inside editor.update.');
  }

  applyDocumentChangeStep(
    editor,
    getActiveDocumentChangeBuilder(editor).replaceRoot(root, children)
  );
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

  if (!getTransactionSpecContext(editor)) {
    throw new Error('Editor roots can only change inside editor.update.');
  }

  applyDocumentChangeStep(
    editor,
    getActiveDocumentChangeBuilder(editor).deleteRoot(targetRoot)
  );
};

const setSelectionValue = (
  editor: Editor,
  selection: Selection,
  root: string
) => {
  const previousSelection = getCurrentSelection(editor);
  const previousRoot = getCurrentSelectionRoot(editor);
  const context = getTransactionSpecContext(editor);

  if (context) {
    context.selection = cloneValue(selection);
    context.selectionRoot = root;
  } else {
    setSelectionStateSelection(editor, selection, root);
  }

  if (
    previousRoot !== root ||
    !SelectionApi.equals(previousSelection, selection)
  ) {
    const snapshot = getTransactionSnapshot(editor);

    if (snapshot) recordFacetDraftSelectionChange(snapshot.facet);
  }
};

export const getCurrentMarks = (editor: Editor): EditorMarks | null => {
  const selection = getCurrentSelection(editor);

  return SelectionApi.isText(selection) && RangeApi.isCollapsed(selection)
    ? ((cloneValue(selection.marks) as EditorMarks | undefined) ?? null)
    : null;
};

export const setCurrentMarks = (editor: Editor, marks: EditorMarks | null) => {
  const selection = getCurrentSelection(editor);

  if (!SelectionApi.isText(selection) || !RangeApi.isCollapsed(selection)) {
    if (marks === null) return;

    throw new Error(
      'Pending insertion marks require a collapsed text selection.'
    );
  }

  const { marks: _marks, ...selectionWithoutMarks } = selection;
  const nextSelection = marks
    ? { ...selectionWithoutMarks, marks: cloneValue(marks) }
    : selectionWithoutMarks;

  if (SelectionApi.equals(selection, nextSelection)) return;

  setCurrentSelection(editor, nextSelection, getCurrentSelectionRoot(editor));
  syncImplicitTargetToCurrentSelection(editor);
};

export const getCurrentSelection = (editor: Editor): Selection => {
  const context = getTransactionSpecContext(editor);

  return cloneValue(
    context ? context.selection : getSelectionStateSelection(editor)
  );
};

export const getCurrentSelectionRoot = (editor: Editor): string =>
  getTransactionSpecContext(editor)?.selectionRoot ??
  getSelectionStateRoot(editor);

const selectionPositionEquals = (left: Selection, right: Selection) => {
  const withoutPendingMarks = (selection: Selection) => {
    if (!SelectionApi.isText(selection)) return selection;

    const { marks: _marks, ...position } = selection;

    return position;
  };

  return SelectionApi.equals(
    withoutPendingMarks(left),
    withoutPendingMarks(right)
  );
};

export const setEditorComposing = (
  editor: AnyExtensionEditor,
  composing: boolean
) => {
  if ((EDITOR_COMPOSING.get(editor) ?? false) === composing) return;

  EDITOR_COMPOSING.set(editor, composing);
  notifyEditorViewState(editor);
};

export const setEditorFocused = (
  editor: AnyExtensionEditor,
  focused: boolean
) => {
  if ((EDITOR_FOCUSED.get(editor) ?? false) === focused) return;

  EDITOR_FOCUSED.set(editor, focused);
  notifyEditorViewState(editor);
};

const normalizeEditorMaxLength = (maxLength: number | undefined) => {
  if (maxLength === undefined) {
    return;
  }

  if (!Number.isSafeInteger(maxLength) || maxLength < 0) {
    throw new Error('[Plite] maxLength must be a non-negative safe integer.');
  }

  return maxLength;
};

const normalizeEditorDefaultBlockType = (defaultBlockType?: string) => {
  if (defaultBlockType === undefined) return 'p';

  if (defaultBlockType.length === 0) {
    throw new Error('[Plite] defaultBlockType must be a non-empty string.');
  }

  return defaultBlockType;
};

export const getEditorDefaultBlockType = (editor: AnyExtensionEditor): string =>
  EDITOR_DEFAULT_BLOCK_TYPE.get(editor) ?? 'p';

export const setEditorDefaultBlockType = (
  editor: AnyExtensionEditor,
  defaultBlockType?: string
) => {
  EDITOR_DEFAULT_BLOCK_TYPE.set(
    editor,
    normalizeEditorDefaultBlockType(defaultBlockType)
  );
};

export const getEditorMaxLength = (
  editor: AnyExtensionEditor
): number | undefined => EDITOR_MAX_LENGTH.get(editor);

export const setEditorMaxLength = (
  editor: AnyExtensionEditor,
  maxLength: number | undefined
) => {
  EDITOR_MAX_LENGTH.set(editor, normalizeEditorMaxLength(maxLength));
};

export const setEditorReadOnly = (
  editor: AnyExtensionEditor,
  readOnly: boolean
) => {
  if ((EDITOR_READ_ONLY.get(editor) ?? false) === readOnly) return;

  EDITOR_READ_ONLY.set(editor, readOnly);
  notifyEditorViewState(editor);
};

const notifyEditorViewState = (editor: AnyExtensionEditor) => {
  scheduleMicrotask(() => {
    EDITOR_VIEW_STATE_LISTENERS.get(editor)?.forEach((listener) => {
      listener();
    });
  });
};

export const subscribeEditorViewState = (
  editor: AnyExtensionEditor,
  listener: () => void
) => {
  const listeners = EDITOR_VIEW_STATE_LISTENERS.get(editor) ?? new Set();

  listeners.add(listener);
  EDITOR_VIEW_STATE_LISTENERS.set(editor, listeners);

  return () => {
    listeners.delete(listener);

    if (listeners.size === 0) {
      EDITOR_VIEW_STATE_LISTENERS.delete(editor);
    }
  };
};

export const getPublicSelection = (editor: Editor): Selection =>
  getCurrentSelection(editor);

export const setCurrentSelection = (
  editor: Editor,
  selection: Selection,
  root = getActiveUpdateRoot(editor) ?? getCurrentSelectionRoot(editor)
) => {
  assertSelectionSupported(
    editor,
    selection,
    getEditorDocumentValue(editor),
    root
  );
  setSelectionValue(editor, selection, root);
  bumpMutationVersion(editor);
  clearSnapshotCache(editor);
  markTransactionChanged(editor);
};

/** @internal Replace bootstrap selection without creating mutation authority. */
export const initializeEditorSchemaSelection = (
  editor: Editor,
  selection: Selection,
  root = getCurrentSelectionRoot(editor)
) => {
  const owner = getEditorRuntimeOwner(editor);

  assertSelectionSupported(
    owner,
    selection,
    getEditorDocumentValue(owner),
    root
  );
  setSelectionValue(owner, selection, root);
  clearSnapshotCache(owner);
};

/** @internal Invalidate detached specs after one successful bootstrap. */
export const invalidateEditorTransactionSpecs = (editor: Editor) => {
  const owner = getEditorRuntimeOwner(editor);

  MUTATION_VERSION.set(owner, (MUTATION_VERSION.get(owner) ?? 0) + 1);
};

export const syncImplicitTargetToCurrentSelection = (editor: Editor) => {
  const snapshot = getTransactionSnapshot(editor);

  if (!snapshot) {
    return;
  }

  snapshot.implicitTarget = cloneValue(getCurrentSelection(editor));
  snapshot.implicitTargetResolved = true;
};

export const transformImplicitTarget = (
  editor: Editor,
  change: DocumentChange,
  before: EditorDocumentValue,
  after: EditorDocumentValue,
  root: RootKey,
  options: Readonly<{
    preferPositionMapping?: boolean;
    runtimeIndexes?: Readonly<{
      after: SnapshotIndex;
      before: SnapshotIndex;
    }>;
  }> = {}
) => {
  const snapshot = getTransactionSnapshot(editor);

  if (!snapshot?.implicitTargetResolved || !snapshot.implicitTarget) {
    return;
  }

  snapshot.implicitTarget = mapSelectionThroughChange(
    editor,
    snapshot.implicitTarget,
    change,
    before,
    after,
    root,
    options
  );
};

export const getActiveImplicitTarget = (
  editor: Editor
): Selection | undefined => {
  const snapshot = getTransactionSnapshot(editor);

  return snapshot?.implicitTargetResolved ? snapshot.implicitTarget : undefined;
};

export const setActiveImplicitTarget = (editor: Editor, target: Selection) => {
  const snapshot = getTransactionSnapshot(editor);

  if (snapshot?.implicitTargetResolved) {
    snapshot.implicitTarget = target;
  }
};

export const resolveImplicitTarget = (
  editor: Editor,
  fallback: Selection
): Selection =>
  resolveTargetRuntimeImplicitTarget(editor, fallback, (target) => {
    setCurrentSelection(editor, target);
  });

export const hasInternalEditorState = (value: unknown): value is Editor =>
  typeof value === 'object' &&
  value !== null &&
  CHILDREN.has(value as Editor) &&
  ROOTS.has(value as Editor);

const getTransactionView = (editor: Editor): EditorTransaction => {
  const context = getTransactionSpecContext(editor);
  const existing = context?.transactionView;

  if (existing) {
    return existing;
  }

  const transaction = Object.freeze({
    get children() {
      return getChildren(editor);
    },
    getModelSelection() {
      return getCurrentSelection(editor);
    },
    getSelectionMarks() {
      return getSelectionMarks(editor);
    },
    get marks() {
      return getCurrentMarks(editor);
    },
    resolveTarget(options: { at?: Location } = {}) {
      if (options.at !== undefined) {
        return options.at;
      }

      return profileCoreDuration('transaction-resolve-target', () => {
        const snapshot = getTransactionSnapshot(editor);

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

      if (SelectionApi.equals(currentSelection, selection)) return;

      setCurrentSelection(editor, selection);
      syncImplicitTargetToCurrentSelection(editor);
    },
  }) as unknown as EditorTransaction;

  if (!context) {
    throw new Error('Missing editor transaction draft.');
  }
  context.transactionView = transaction;

  return transaction;
};

export const getSnapshot = (editor: Editor): EditorSnapshot => {
  const cached = getCachedSnapshot(editor);

  if (cached) {
    return cached;
  }

  const liveChildren = getChildren(editor);
  const children = Object.isFrozen(liveChildren)
    ? liveChildren
    : cloneFrozen(liveChildren);
  const selection = cloneFrozenEditorJsonValue(getCurrentSelection(editor));
  const owner = getEditorRuntimeOwner(editor);
  let index: SnapshotIndex | undefined;
  const snapshot = {
    children,
    selection,
    version: getVersion(editor),
  };

  Object.defineProperty(snapshot, 'index', {
    enumerable: true,
    get: () => (index ??= buildSnapshotIndex(owner, children)),
  });

  const frozen = Object.freeze(snapshot) as unknown as EditorSnapshot;

  setCachedSnapshot(editor, frozen);

  return frozen;
};

const getSnapshotNode = (
  children: readonly Descendant[],
  path: Path
): Descendant | undefined => {
  let nodes = children;
  let node: Descendant | undefined;

  for (const index of path) {
    node = nodes[index];

    if (!node) return;

    nodes = NodeApi.isElement(node) ? node.children : [];
  }

  return node;
};

const shareSnapshotNode = (
  editor: Editor,
  node: Descendant,
  path: Path,
  previousSnapshot: EditorSnapshot
): Descendant => {
  const runtimeId = getOrCreateRuntimeId(node, editor);
  const previousPath = previousSnapshot.index.pathOf(runtimeId);
  const previousNode = previousPath
    ? getSnapshotNode(previousSnapshot.children, previousPath)
    : undefined;

  if (previousNode && areEditorJsonValuesEqual(previousNode, node)) {
    return previousNode;
  }

  const props = Object.fromEntries(
    Object.entries(node)
      .filter(([key]) => key !== 'children')
      .map(([key, value]) => [key, cloneFrozen(value)])
  );
  const nextNode = NodeApi.isElement(node)
    ? Object.freeze({
        ...props,
        children: Object.freeze(
          node.children.map((child, index) =>
            shareSnapshotNode(
              editor,
              child,
              [...path, index] as Path,
              previousSnapshot
            )
          )
        ),
      })
    : Object.freeze(props);

  inheritRuntimeId(nextNode, node, editor);

  return nextNode as Descendant;
};

const shareSnapshotChildren = (
  editor: Editor,
  children: readonly Descendant[],
  previousSnapshot: EditorSnapshot
): readonly Descendant[] =>
  Object.freeze(
    children.map((node, index) =>
      shareSnapshotNode(editor, node, [index], previousSnapshot)
    )
  );

const getSelectionOnlySnapshot = (
  editor: Editor,
  previousSnapshot: EditorSnapshot
): EditorSnapshot => {
  const snapshot = {
    children: previousSnapshot.children,
    selection: cloneFrozenEditorJsonValue(getCurrentSelection(editor)),
    version: getVersion(editor),
  };

  Object.defineProperty(snapshot, 'index', {
    enumerable: true,
    get: () => previousSnapshot.index,
  });

  return Object.freeze(snapshot) as unknown as EditorSnapshot;
};

const getRootScopedSelection = (
  selection: Selection,
  selectionRoot: string,
  root: string
): Selection =>
  selectionRoot === root ? cloneFrozenEditorJsonValue(selection) : null;

const snapshotIndexesEqual = (left: SnapshotIndex, right: SnapshotIndex) => {
  const leftEntries = left.entries();
  const rightEntries = right.entries();

  return (
    leftEntries.length === rightEntries.length &&
    leftEntries.every(([runtimeId, path]) => right.idAt(path) === runtimeId)
  );
};

function getTransactionSnapshotIndex(
  editor: Editor,
  transactionSnapshot: TransactionSnapshot,
  root: string
): SnapshotIndex {
  const existingIndex =
    transactionSnapshot.rootIndexes[root] ??
    transactionSnapshot.baseRuntimeIndexes[root]?.() ??
    (root === transactionSnapshot.childrenRoot
      ? transactionSnapshot.previousSnapshot?.index
      : null);

  if (existingIndex) {
    return existingIndex;
  }

  const index = buildSnapshotIndex(
    getEditorRuntimeOwner(editor),
    transactionSnapshot.roots[root] ?? []
  );

  transactionSnapshot.rootIndexes[root] = index;

  return index;
}

const getTransactionRootSnapshot = (
  editor: Editor,
  transactionSnapshot: TransactionSnapshot,
  root: string
): EditorSnapshot => {
  const children = transactionSnapshot.roots[root] ?? [];
  const index = getTransactionSnapshotIndex(editor, transactionSnapshot, root);

  return Object.freeze({
    children: Object.isFrozen(children) ? children : cloneFrozen(children),
    index,
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
  root: string,
  previousSnapshot?: EditorSnapshot,
  knownIndex?: SnapshotIndex
): EditorSnapshot => {
  const owner = getEditorRuntimeOwner(editor);
  const liveChildren = getEditorDocumentRoots(editor)[root] ?? [];
  const selectionRoot = getCurrentSelectionRoot(editor);
  const children = profileCoreDuration('snapshot-clone-children', () =>
    Object.isFrozen(liveChildren)
      ? liveChildren
      : previousSnapshot
        ? shareSnapshotChildren(owner, liveChildren, previousSnapshot)
        : cloneFrozen(liveChildren)
  );
  let index = knownIndex;
  const snapshot = {
    children,
    selection: getRootScopedSelection(
      getCurrentSelection(editor),
      selectionRoot,
      root
    ),
    version: getVersion(editor),
  };

  DocumentIndex.fromValue(children);
  Object.defineProperty(snapshot, 'index', {
    enumerable: true,
    get: () => {
      index ??= profileCoreDuration('snapshot-build-index', () => {
        const builtIndex = buildSnapshotIndex(owner, children);

        return previousSnapshot &&
          snapshotIndexesEqual(previousSnapshot.index, builtIndex)
          ? previousSnapshot.index
          : builtIndex;
      });

      return index;
    },
  });

  return Object.freeze(snapshot) as unknown as EditorSnapshot;
};

const getListenerSnapshot = (
  editor: Editor,
  _change?: EditorCommit
): EditorSnapshot =>
  withEditorRootChildren(editor, MAIN_ROOT_KEY, () => getSnapshot(editor));

const CHANGE_VALUES = new WeakMap<
  readonly Descendant[],
  Readonly<{
    roots: readonly (readonly [string, readonly Descendant[]])[];
    value: JsonEditorValue;
  }>[]
>();

const getChangeValue = (
  roots: Readonly<Record<string, readonly Descendant[]>>
): JsonEditorValue => {
  const children = roots[MAIN_ROOT_KEY] ?? [];
  const rootEntries = Object.entries(roots)
    .filter(([root]) => root !== MAIN_ROOT_KEY)
    .sort(([left], [right]) => left.localeCompare(right));
  const cached = CHANGE_VALUES.get(children)?.find(
    (entry) =>
      entry.roots.length === rootEntries.length &&
      entry.roots.every(
        ([root, value], index) =>
          root === rootEntries[index]![0] && value === rootEntries[index]![1]
      )
  );

  if (cached) return cached.value;
  const secondaryRoots = Object.freeze(Object.fromEntries(rootEntries));
  const value = Object.freeze({
    children,
    ...(rootEntries.length > 0 ? { roots: secondaryRoots } : {}),
  });
  const entries = CHANGE_VALUES.get(children) ?? [];

  entries.push(
    Object.freeze({
      roots: Object.freeze(
        rootEntries.map(([root, rootChildren]) =>
          Object.freeze([root, rootChildren] as const)
        )
      ),
      value,
    })
  );
  CHANGE_VALUES.set(children, entries);

  return value;
};

export const getActiveTransactionDocumentChange = (editor: Editor) => {
  const snapshot = getTransactionSnapshot(editor);

  if (!snapshot) {
    throw new Error('Structural correction requires an active transaction.');
  }

  const change = snapshot.activeChange.change;

  return [...getInternalDocumentChangeEntries(change)].every(
    ([root]) => !!getInternalDocumentChangeClassification(change, root)
  )
    ? change
    : snapshot.builder.classify(change);
};

export const getActiveDocumentChangeBuilder = (editor: Editor) => {
  const snapshot = getTransactionSnapshot(editor);

  if (!snapshot) {
    throw new Error('Document change builders require an active transaction.');
  }

  return snapshot.builder;
};

const getProtectedInlineSpacerNodes = (
  editor: Editor,
  value: JsonEditorValue,
  root: string
) => {
  const paths =
    getTransactionSnapshot(editor)?.protectedInlineSpacerPaths.get(root);

  if (!paths?.length) return;
  const children =
    root === MAIN_ROOT_KEY ? value.children : (value.roots?.[root] ?? []);
  const rootNode = { children } as PliteNode;
  const nodes = new Set<Descendant>();

  for (const path of paths) {
    const node = NodeApi.getIf(rootNode, path);

    if (
      node &&
      NodeApi.isElement(node) &&
      getEditorSchema(editor).isInline(node)
    ) {
      nodes.add(node);
    }
  }

  return nodes;
};

const createEditorDocumentChangeBuilder = (
  editor: Editor,
  value: JsonEditorValue,
  options: Readonly<{
    /** Configuration publication performs one explicit full-document validation. */
    validation?: 'configuration-publication' | 'incremental';
  }> = {}
) => {
  const revision = getExtensionRegistry(editor);
  const schema = getEditorSchema(editor);
  const validation = options.validation ?? 'incremental';
  const assertRevision = () => {
    if (getExtensionRegistry(editor) !== revision) {
      throw new Error(
        'Document construction cannot cross an editor schema revision.'
      );
    }
  };

  return new ChangeDraft(value, {
    assertCanonical: (candidate, change) => {
      assertRevision();
      if (
        !constructCanonicalDocumentChange(editor, candidate, change, {
          preserveInlineSpacersAdjacentTo: (root) =>
            getProtectedInlineSpacerNodes(editor, candidate, root),
        }).empty
      ) {
        throw new Error(
          'Document changes must already use canonical editor representation.'
        );
      }
    },
    construct: ({ after, change }, preparation) => {
      assertRevision();

      return constructCanonicalDocumentChange(editor, after, change, {
        fitPreparation: preparation,
        preserveInlineSpacersAdjacentTo: (root) =>
          getProtectedInlineSpacerNodes(editor, after, root),
      });
    },
    indexConstructedRoot: schema.indexConstructedRoot,
    isSetValued: (node, key, context) =>
      schema.isSetValuedProperty(node, key, context),
    preparationAuthority: revision,
    preparationRevision: () => revision,
    ...(validation === 'incremental'
      ? {
          validate: (candidate) => {
            assertRevision();
            schema.validateDocument(candidate as EditorDocumentValue);
          },
          validateConstructed: ({
            after,
            before,
            change,
            indexedAfter,
            indexedBefore,
          }) => {
            assertRevision();
            profileCoreDuration('schema-validation-incremental', () =>
              schema.validateDocumentChange({
                after: after as EditorDocumentValue,
                before: before as EditorDocumentValue,
                change,
                indexedAfter,
                indexedBefore,
              })
            );
          },
        }
      : {}),
  });
};

const rebindTransactionBuilderToCurrentSchema = (
  editor: Editor,
  snapshot: TransactionSnapshot
) => {
  const accumulated = snapshot.activeChange.change;
  const builder = createEditorDocumentChangeBuilder(
    editor,
    getChangeValue(snapshot.roots),
    { validation: 'configuration-publication' }
  );

  if (!accumulated.empty) builder.apply(accumulated);

  snapshot.builder = builder;
  snapshot.activeChange = { change: builder.change };
};

export const applyDocumentChangeStep = (
  editor: Editor,
  step: DocumentChangeStep,
  options: ApplyDocumentChangeOptions = {}
) => {
  if (!getTransactionSpecContext(editor)) {
    throw new Error('Document changes require an active transaction draft.');
  }

  applyTransactionSpecDocumentChangeStep(editor, step, options);
};

export const applyBuiltDocumentChange = (
  editor: Editor,
  build: (builder: ChangeDraft, root: RootKey) => DocumentChangeStep,
  options: ApplyDocumentChangeOptions &
    Readonly<{
      runtimeIdTransfers?: readonly Readonly<{
        path: Path;
        source: Descendant;
      }>[];
    }> = {}
) => {
  const root = getActiveUpdateRoot(editor) ?? MAIN_ROOT_KEY;
  const step = build(getActiveDocumentChangeBuilder(editor), root);
  const { runtimeIdTransfers, ...applyOptions } = options;

  if (runtimeIdTransfers) {
    const children = getDocumentRootChildren(step.after, root);
    const owner = getEditorRuntimeOwner(editor);

    for (const transfer of runtimeIdTransfers) {
      const node = NodeApi.get({ children } as PliteNode, transfer.path);

      inheritRuntimeIds(node as Descendant, transfer.source, owner);
    }
  }

  return applyDocumentChangeStep(editor, step, applyOptions);
};

const createTransactionChanged = ({
  after,
  before,
  change,
  indexedAfter = new Map(),
  indexedBefore = new Map(),
}: Readonly<{
  after: EditorDocumentValue;
  before: EditorDocumentValue;
  change: DocumentChange;
  indexedAfter?: ReadonlyMap<string, DocumentIndex>;
  indexedBefore?: ReadonlyMap<string, DocumentIndex>;
}>): EditorTransactionChanged => {
  const afterIndexes = new Map(indexedAfter);
  const beforeIndexes = new Map(indexedBefore);
  const classifications = new Map<
    string,
    ReturnType<typeof classifyDocumentChangeRoot>
  >();
  const changedPaths = new Map<string, readonly Path[]>();
  const topLevelRanges = new Map<
    string,
    ReturnType<typeof getDocumentChangeTopLevelRanges>
  >();

  const getRootChildren = (value: EditorDocumentValue, root: string) =>
    (root === MAIN_ROOT_KEY
      ? value.children
      : (value.roots?.[root] ?? [])) as readonly Descendant[];
  const getIndex = (phase: 'after' | 'before', root: string): DocumentIndex => {
    const indexes = phase === 'after' ? afterIndexes : beforeIndexes;
    const cached = indexes.get(root);

    if (cached) return cached;

    const index = DocumentIndex.fromValue(
      getRootChildren(phase === 'after' ? after : before, root)
    );

    indexes.set(root, index);

    return index;
  };
  const getClassification = (root: string) => {
    const cached = classifications.get(root);

    if (cached) return cached;

    const existing = getInternalDocumentChangeClassification(change, root);

    if (existing) {
      classifications.set(root, existing);

      return existing;
    }

    const rootChange = getInternalDocumentRootChange(change, root);

    if (!rootChange) return null;

    const classification = classifyDocumentChangeRoot(
      rootChange,
      getIndex('before', root),
      getIndex('after', root)
    );

    classifications.set(root, classification);

    return classification;
  };
  const getPaths = (root: string): readonly Path[] => {
    const cached = changedPaths.get(root);

    if (cached) return cached;

    const classification = getClassification(root);
    const rootChange = getInternalDocumentRootChange(change, root);
    const paths = Object.freeze(
      (classification && !classification.structure
        ? classification.paths
        : rootChange
          ? getDocumentChangeAfterPaths(rootChange, getIndex('after', root))
          : []
      ).map((path) => Object.freeze([...path]) as Path)
    );

    changedPaths.set(root, paths);

    return paths;
  };
  const getTopLevelRanges = (root: string) => {
    const cached = topLevelRanges.get(root);

    if (cached) return cached;

    const rootChange = getInternalDocumentRootChange(change, root);
    const ranges = rootChange
      ? getDocumentChangeTopLevelRanges(
          rootChange,
          getIndex('before', root),
          getIndex('after', root)
        )
      : Object.freeze([]);

    topLevelRanges.set(root, ranges);

    return ranges;
  };

  return Object.freeze({
    has: (kind, root) => {
      const internalRoot = toInternalRoot(root);
      const classification = getClassification(internalRoot);

      return kind === 'structure'
        ? Boolean(
            classification?.structure ||
              change.createRoots.has(internalRoot) ||
              change.deleteRoots.has(internalRoot)
          )
        : (classification?.[kind] ?? false);
    },
    paths: (root) => getPaths(toInternalRoot(root)),
    topLevelRanges: (root) => getTopLevelRanges(toInternalRoot(root)),
  });
};

export const recordTransactionDocumentChange = (
  editor: Editor,
  change: DocumentChange,
  context?: {
    after: EditorDocumentValue;
    before: EditorDocumentValue;
  }
) => {
  if (change.empty) return;

  const snapshot = getTransactionSnapshot(editor);

  if (!snapshot) {
    throw new Error('Document changes require an active transaction.');
  }

  snapshot.activeChange = {
    change: snapshot.activeChange.change.compose(
      change,
      getChangeValue(snapshot.roots)
    ),
  };

  if (context) {
    const listeners = [
      ...(getTransactionSpecContext(editor)?.kind === 'spec'
        ? snapshot.transactionChangeObservers
        : [
            ...getExtensionRegistry(editor).transactionChangeListeners,
            ...snapshot.transactionChangeObservers,
          ]),
    ];

    if (listeners.length > 0) {
      const changeContext = {
        ...context,
        change,
        changed: createTransactionChanged({ ...context, change }),
        editor,
        selectionAfter: getCurrentSelection(editor),
        selectionAfterRoot: toPublicRoot(getCurrentSelectionRoot(editor)),
        selectionBefore: getCurrentSelection(editor),
        selectionBeforeRoot: toPublicRoot(getCurrentSelectionRoot(editor)),
        tx: getActiveUpdateView(editor),
      };

      for (const listener of listeners) {
        listener(changeContext);
      }
    }
  }
};

/** Observe document changes only for the duration of the active transaction. */
export const withTransactionDocumentChangeObserver = <T>(
  editor: Editor,
  listener: import('../interfaces/editor').EditorTransactionChangeHandler,
  fn: () => T
): T => {
  const snapshot = getTransactionSnapshot(editor);

  if (!snapshot) {
    throw new Error(
      'Transaction document-change observers require an active transaction.'
    );
  }

  const scopedListener: typeof listener = (context) => listener(context);

  snapshot.transactionChangeObservers.add(scopedListener);

  try {
    return fn();
  } finally {
    snapshot.transactionChangeObservers.delete(scopedListener);
  }
};

type ApplyDocumentChangeOptions = Readonly<{
  notifyTransactionListeners?: boolean;
  selectionAfter?: Selection;
  selectionAssociation?: 'backward' | 'forward' | 'inward' | 'outward';
  selectionMapping?: 'representation';
  selectionRoot?: RootKey;
}>;

const getDocumentRootChildren = (
  value: JsonEditorValue,
  root: RootKey
): readonly Descendant[] =>
  (root === MAIN_ROOT_KEY
    ? value.children
    : (value.roots?.[root] ?? [])) as readonly Descendant[];

const inheritDocumentChangeStepRuntimeIds = (
  editor: Editor,
  snapshot: TransactionSnapshot,
  step: DocumentChangeStep,
  options: Readonly<{ defer?: boolean }> = {}
) => {
  const owner = getEditorRuntimeOwner(editor);
  const publishRuntimeIds = getTransactionSpecContext(editor)?.kind !== 'spec';
  const indexes = new Map<
    string,
    Readonly<{ after: SnapshotIndex; before: SnapshotIndex }>
  >();

  for (const [root, rootChange] of getInternalDocumentChangeEntries(
    step.change
  )) {
    const beforeChildren = getDocumentRootChildren(step.before, root);
    const afterChildren = getDocumentRootChildren(step.after, root);
    const before =
      step.indexedBefore.get(root) ?? DocumentIndex.fromValue(beforeChildren);
    const after =
      step.indexedAfter.get(root) ?? DocumentIndex.fromValue(afterChildren);
    const currentIndex = snapshot.rootIndexes[root];
    const baseIndex = snapshot.baseRuntimeIndexes[root];
    const previousIndex =
      root === snapshot.childrenRoot ? snapshot.previousSnapshot?.index : null;
    let sourceIndex: SnapshotIndex | undefined;
    const getSourceIndex = () =>
      (sourceIndex ??= profileCoreDuration(
        'transaction-runtime-source-index',
        () =>
          currentIndex ??
          baseIndex?.() ??
          previousIndex ??
          buildSnapshotIndex(owner, beforeChildren)
      ));
    const mapIndex = () => {
      const source = getSourceIndex();
      const classification = getInternalDocumentChangeClassification(
        step.change,
        root
      );
      const changesElementType =
        classification?.properties === true &&
        classification.paths.some((path) => {
          try {
            const beforeNode = before.node(path as Path);
            const afterNode = after.node(path as Path);

            return (
              ('children' in beforeNode ? beforeNode.type : undefined) !==
              ('children' in afterNode ? afterNode.type : undefined)
            );
          } catch {
            return false;
          }
        });
      const pathStable =
        publishRuntimeIds &&
        classification &&
        !classification.structure &&
        !changesElementType &&
        snapshot.discardedRuntimeIds.size === 0;

      if (pathStable && !snapshot.runtimeIndexRollbacks.has(source)) {
        snapshot.runtimeIndexRollbacks.set(
          source,
          captureSnapshotIndexMapping(source)
        );
      }

      return profileCoreDuration('transaction-runtime-map-index', () =>
        pathStable
          ? advancePathStableSnapshotIndex(
              before,
              after,
              rootChange,
              source,
              owner,
              step.runtimeCandidates.get(root)
            )
          : mapSnapshotIndexThroughChange(
              before,
              after,
              rootChange,
              source,
              owner,
              snapshot.discardedRuntimeIds,
              step.runtimeCandidates.get(root),
              publishRuntimeIds
            )
      );
    };

    if (options.defer) {
      let mappedIndex: SnapshotIndex | undefined;

      delete snapshot.rootIndexes[root];
      snapshot.baseRuntimeIndexes[root] = () => (mappedIndex ??= mapIndex());
      continue;
    }

    const mappedIndex = mapIndex();
    const resolvedSourceIndex = getSourceIndex();

    snapshot.rootIndexes[root] = mappedIndex;
    indexes.set(
      root,
      Object.freeze({ after: mappedIndex, before: resolvedSourceIndex })
    );
  }

  return indexes;
};

const applyTransactionSpecDocumentChangeStep = (
  editor: Editor,
  step: DocumentChangeStep,
  options: ApplyDocumentChangeOptions = {}
) => {
  const snapshot = getTransactionSnapshot(editor);

  const specContext = getTransactionSpecContext(editor);

  if (!snapshot || !specContext) {
    throw new Error('Missing transaction-spec builder state.');
  }

  const before = step.before as EditorDocumentValue;
  const after = step.after as EditorDocumentValue;
  const roots = {
    [MAIN_ROOT_KEY]: after.children,
    ...(after.roots ?? {}),
  } as Record<string, readonly Descendant[]>;
  const activeRoot = getCurrentChildrenRoot(editor);
  const nextRoot = Object.hasOwn(roots, activeRoot)
    ? activeRoot
    : MAIN_ROOT_KEY;
  const selectionBefore = getCurrentSelection(editor);
  const selectionRoot = getCurrentSelectionRoot(editor);
  const hasExplicitSelection = Object.hasOwn(options, 'selectionAfter');
  const runtimeIndexes = profileCoreDuration(
    specContext.kind === 'spec'
      ? 'transaction-draft-runtime-paths'
      : 'transaction-runtime-ids',
    () =>
      inheritDocumentChangeStepRuntimeIds(editor, snapshot, step, {
        defer: specContext.kind === 'spec' && hasExplicitSelection,
      })
  );
  const selectionRuntimeIndexes = runtimeIndexes.get(selectionRoot);
  recordFacetDraftDocumentChange(snapshot.facet, step.change);
  specContext.currentChildrenRoot = nextRoot;

  const mappedSelection = hasExplicitSelection
    ? (options.selectionAfter ?? null)
    : selectionBefore
      ? mapSelectionThroughChange(
          editor,
          selectionBefore,
          step.change,
          before,
          after,
          selectionRoot,
          {
            ...(options.selectionAssociation
              ? { association: options.selectionAssociation }
              : {}),
            ...(options.selectionMapping === 'representation'
              ? { preferPositionMapping: true }
              : {}),
            ...(selectionRuntimeIndexes
              ? { runtimeIndexes: selectionRuntimeIndexes }
              : {}),
          }
        )
      : null;

  setCurrentSelection(
    editor,
    mappedSelection,
    options.selectionRoot ??
      (Object.hasOwn(roots, selectionRoot) ? selectionRoot : nextRoot)
  );
  if (hasExplicitSelection) {
    specContext.selectionWritten = true;
    syncImplicitTargetToCurrentSelection(editor);
  } else {
    transformImplicitTarget(editor, step.change, before, after, selectionRoot, {
      preferPositionMapping: options.selectionMapping === 'representation',
      ...(selectionRuntimeIndexes
        ? { runtimeIndexes: selectionRuntimeIndexes }
        : {}),
    });
  }

  snapshot.activeChange = { change: snapshot.builder.change };
  notifyAnchorChanges(editor, step.change, step.indexedAfter, {
    replace: snapshot.reason === 'replace',
  });
  markTransactionChanged(editor);
  specContext.draftEpoch += 1;

  const listeners = [
    ...(options.notifyTransactionListeners === false
      ? []
      : specContext.kind === 'spec'
        ? snapshot.transactionChangeObservers
        : [
            ...getExtensionRegistry(editor).transactionChangeListeners,
            ...snapshot.transactionChangeObservers,
          ]),
  ];

  if (listeners.length > 0) {
    const context = {
      after,
      before,
      change: step.change,
      changed: createTransactionChanged({
        after,
        before,
        change: step.change,
        indexedAfter: step.indexedAfter,
        indexedBefore: step.indexedBefore,
      }),
      editor,
      selectionAfter: getCurrentSelection(editor),
      selectionAfterRoot: toPublicRoot(getCurrentSelectionRoot(editor)),
      selectionBefore,
      selectionBeforeRoot: toPublicRoot(selectionRoot),
      tx: getActiveUpdateView(editor),
    };

    for (const listener of listeners) {
      listener(context);
    }
  }
};

export const applyDocumentChange = (
  editor: Editor,
  change: DocumentChange,
  options: ApplyDocumentChangeOptions = {}
) => {
  const snapshot = getTransactionSnapshot(editor);

  if (!snapshot || !getTransactionSpecContext(editor)) {
    throw new Error('Document changes require an active transaction draft.');
  }

  applyTransactionSpecDocumentChangeStep(
    editor,
    snapshot.builder.applyCanonical(change),
    options
  );
};

export const notifyListeners = (editor: Editor, change?: EditorCommit) => {
  COMMIT_NOTIFICATION_DEPTH.set(
    editor,
    (COMMIT_NOTIFICATION_DEPTH.get(editor) ?? 0) + 1
  );

  try {
    const listeners = getSnapshotListeners(editor);
    const sourceListeners = getSourceListeners(editor);
    const extensionCommitListeners = change
      ? getExtensionRegistry(editor).commitListeners
      : null;
    const hasAnySourceListeners =
      sourceListeners !== undefined &&
      [...sourceListeners.values()].some((listeners) => listeners.size > 0);
    const sourcesForChange =
      change && hasAnySourceListeners ? getSourcesForChange(change) : [];
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
          listener(change, getSnapshotForListeners());
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
  } finally {
    const depth = (COMMIT_NOTIFICATION_DEPTH.get(editor) ?? 1) - 1;

    if (depth === 0) {
      COMMIT_NOTIFICATION_DEPTH.delete(editor);
    } else {
      COMMIT_NOTIFICATION_DEPTH.set(editor, depth);
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

const createEditorUpdateDraftContext = (
  editor: Editor
): TransactionSpecContext => {
  const childrenRoot = getCurrentChildrenRoot(editor);
  const previousSnapshot =
    getCachedSnapshot(editor, childrenRoot) ??
    profileCoreDuration('transaction-previous-snapshot', () =>
      getSnapshot(editor)
    );
  const roots = getEditorDocumentRoots(editor);
  const transactionRoots = profileCoreDuration(
    'transaction-roots-snapshot',
    () =>
      childrenRoot === MAIN_ROOT_KEY || Object.hasOwn(roots, childrenRoot)
        ? { ...roots, [childrenRoot]: previousSnapshot.children }
        : { ...roots }
  );
  const builder = createEditorDocumentChangeBuilder(
    editor,
    getChangeValue(transactionRoots)
  );
  const documentState = copyDocumentState(DOCUMENT_STATE.get(editor));
  const selection = previousSnapshot.selection ?? getCurrentSelection(editor);
  const selectionRoot = getCurrentSelectionRoot(editor);
  const cachedSnapshots = new Map(SNAPSHOT_CACHE.get(editor) ?? []);

  cachedSnapshots.set(childrenRoot, previousSnapshot);
  const baseSnapshots = Object.fromEntries(cachedSnapshots);
  const snapshot: TransactionSnapshot = {
    activeChange: { change: builder.change },
    afterCommitHandlers: [],
    annotations: new Map(),
    baseRuntimeIndexes: Object.fromEntries(
      [...cachedSnapshots].map(([root, cached]) => [root, () => cached.index])
    ),
    baseSnapshots,
    builder,
    childrenRoot,
    contentSliceRoots: new Set(),
    documentState,
    discardedRuntimeIds: new Set(),
    dirtyStateKeys: new Set(),
    draftRefs: new Set(),
    effects: [],
    extensionReconfigurations: new Map(),
    facet: createEditorFacetDraft(editor, getVersion(editor)),
    implicitTarget: null,
    implicitTargetResolved: false,
    previousSnapshot,
    previousVersion: previousSnapshot.version,
    protectedInlineSpacerPaths: new Map(),
    reason: null,
    rootIndexes: {},
    roots: transactionRoots,
    runtimeIndexRollbacks: new Map(),
    selection,
    selectionRoot,
    skipCorrections: false,
    tags: new Set(getCurrentUpdateTags(editor)),
    transactionChangeObservers: new Set(),
    token: { active: true },
  };
  const context: TransactionSpecContext = {
    ...(getEditorChildrenRoot(editor)
      ? { activeChildrenRoot: getEditorChildrenRoot(editor) }
      : {}),
    ...(getActiveUpdateRoot(editor)
      ? { activeUpdateRoot: getActiveUpdateRoot(editor) }
      : {}),
    baseDraftEpoch: 0,
    baseRevision: getMutationVersion(editor),
    changed: false,
    currentChildrenRoot: childrenRoot,
    depth: 0,
    documentState: copyDocumentState(documentState),
    draftEpoch: 0,
    exitAnchorScope: () => {},
    id: {},
    kind: 'update',
    mutationVersion: getMutationVersion(editor),
    selection: cloneValue(selection),
    selectionRoot,
    selectionWritten: false,
    snapshot,
  };
  const contexts = TRANSACTION_SPEC_CONTEXTS.get(editor) ?? [];

  contexts.push(context);
  TRANSACTION_SPEC_CONTEXTS.set(editor, contexts);
  try {
    context.exitAnchorScope = enterAnchorScope(
      editor,
      createEditorDocumentValue({
        children: (transactionRoots[MAIN_ROOT_KEY] ?? []) as Value,
        fields: getStateFieldIdentityMap(editor),
        meta: documentState,
        roots: transactionRoots,
      })
    );
  } catch (error) {
    contexts.pop();
    if (contexts.length === 0) TRANSACTION_SPEC_CONTEXTS.delete(editor);
    throw error;
  }

  return context;
};

const publishTransactionDraft = (
  editor: Editor,
  context: TransactionSpecContext,
  roots: Readonly<Record<string, readonly Descendant[]>>
) => {
  const selection = cloneValue(context.selection);
  const documentState = copyDocumentState(context.documentState);

  const currentRoot = Object.hasOwn(roots, context.currentChildrenRoot)
    ? context.currentChildrenRoot
    : MAIN_ROOT_KEY;

  ROOTS.set(editor, roots);
  CURRENT_CHILDREN_ROOT.set(editor, currentRoot);
  CHILDREN.set(editor, roots[currentRoot] ?? []);
  setSelectionStateSelection(editor, selection, context.selectionRoot);
  if (documentState === undefined) DOCUMENT_STATE.delete(editor);
  else DOCUMENT_STATE.set(editor, documentState);
  MUTATION_VERSION.set(editor, context.mutationVersion);
  clearSnapshotCache(editor);
};

const withExtensionPublicationRollback = <T>(
  publication: { rollback: () => void } | undefined,
  publish: () => T
): T => {
  try {
    return publish();
  } catch (error) {
    publication?.rollback();
    throw error;
  }
};

const assertSynchronousEditorUpdateResult = (result: unknown) => {
  if (
    result !== null &&
    (typeof result === 'object' || typeof result === 'function') &&
    typeof (result as { then?: unknown }).then === 'function'
  ) {
    throw new Error('editor.update callback must be synchronous');
  }
};

export const runEditorTransaction = (
  editor: Editor,
  fn: (transaction: EditorTransaction) => unknown,
  options: {
    authority?: TransactionAuthority;
    skipCorrections?: boolean;
  } = {}
) => {
  const depth = getEditorTransactionDepth(editor);

  if (depth > 0) {
    incrementEditorTransactionDepth(editor, depth);

    try {
      assertSynchronousEditorUpdateResult(fn(getTransactionView(editor)));
    } finally {
      decrementEditorTransactionDepth(editor);
    }

    return null;
  }

  let extensionPublication:
    | ReturnType<InternalEditorRuntime['prepareExtensionPublication']>
    | undefined;
  let committed: EditorCommit | null = null;
  let draftContext: TransactionSpecContext | undefined;
  let transactionFailed = false;

  assertCanStartEditorWrite(editor, options.authority);
  draftContext = createEditorUpdateDraftContext(editor);

  incrementEditorTransactionDepth(editor, depth);

  try {
    const transaction = getTransactionView(editor);
    const result = profileCoreDuration('transaction-callback', () =>
      fn(transaction)
    );

    assertSynchronousEditorUpdateResult(result);

    reconcileExclusiveElementOwnedRoots(editor);
    finalizeTransactionRepresentation(editor);
    if (reconcileExclusiveElementOwnedRoots(editor)) {
      finalizeTransactionRepresentation(editor);
    }

    const snapshot = getTransactionSnapshot(editor);
    const hasDocumentChange = !(snapshot?.activeChange.change.empty ?? true);

    if (
      draftContext?.changed &&
      !(options.skipCorrections || snapshot?.skipCorrections) &&
      hasDocumentChange &&
      getExtensionRegistry(editor).corrections.size > 0
    ) {
      const activeChange = profileCoreDuration(
        'transaction-active-change',
        () => getActiveTransactionDocumentChange(editor)
      );
      const changedRoots = new Set([
        ...[...getInternalDocumentChangeEntries(activeChange)].map(
          ([root]) => root
        ),
        ...activeChange.createRoots,
      ]);

      for (const root of changedRoots) {
        if (activeChange.deleteRoots.has(root)) continue;

        const correct = () =>
          profileCoreDuration('transaction-correct', () =>
            correctDocument(editor, {
              force: false,
              root,
            })
          );

        withEditorUpdateRoot(editor, root, () =>
          withEditorUpdateRootChildren(editor, root, correct)
        );
      }
    }

    reconcileExclusiveElementOwnedRoots(editor);
    finalizeTransactionRepresentation(editor);
    if (reconcileExclusiveElementOwnedRoots(editor)) {
      finalizeTransactionRepresentation(editor);
    }

    if (snapshot?.extensionReconfigurations.size) {
      const stagedReconfigurations = [
        ...snapshot.extensionReconfigurations.values(),
      ];
      const migrations = stagedReconfigurations.flatMap(({ migrate }) =>
        migrate ? [migrate] : []
      );

      if (migrations.length > 1) {
        throw new Error(
          'One editor update cannot stage multiple schema migration callbacks.'
        );
      }
      const entries = stagedReconfigurations.flatMap(
        ({ editor: extensionEditor, input }) =>
          (Array.isArray(input) ? input : [input]).map((extension) =>
            Object.freeze({
              editor: extensionEditor,
              extension,
            })
          )
      ) satisfies readonly InternalEditorExtensionPublicationEntry[];

      extensionPublication = getEditorRuntime(
        editor
      ).prepareExtensionPublication(entries, {
        ...(migrations[0] ? { migrate: migrations[0] } : {}),
      });

      if (!extensionPublication.configurationChanged) {
        extensionPublication.rollback();
        extensionPublication = undefined;
        snapshot.extensionReconfigurations.clear();
        snapshot.dirtyStateKeys.delete('$configuration');
      } else {
        extensionPublication.stage();
      }

      if (extensionPublication && !extensionPublication.documentChange.empty) {
        withExtensionPublicationRollback(extensionPublication, () => {
          extensionPublication?.commit();
          rebindTransactionBuilderToCurrentSchema(editor, snapshot);
        });
        applyTransactionSpecDocumentChangeStep(
          editor,
          snapshot.builder.apply(extensionPublication.documentChange),
          { notifyTransactionListeners: false }
        );
        reconcileExclusiveElementOwnedRoots(editor);
        finalizeTransactionRepresentation(editor);
        if (reconcileExclusiveElementOwnedRoots(editor)) {
          finalizeTransactionRepresentation(editor);
        }
      }

      extensionPublication?.validateDocument(getEditorDocumentValue(editor));
    }
  } catch (error) {
    transactionFailed = true;
    extensionPublication?.rollback();
    extensionPublication = undefined;
    throw error;
  } finally {
    decrementEditorTransactionDepth(editor);

    if (draftContext) {
      const snapshot = requireCommittedTransactionSnapshot(
        draftContext.snapshot
      );

      if (transactionFailed) {
        for (const restore of snapshot.runtimeIndexRollbacks.values()) {
          restore();
        }
        disposeTransactionSpecContext(editor, draftContext);
      } else {
        const changed =
          draftContext.changed &&
          profileCoreDuration('transaction-has-net-changes', () =>
            hasTransactionNetChanges(editor, snapshot)
          );

        if (!changed) {
          extensionPublication?.rollback();
          for (const restore of snapshot.runtimeIndexRollbacks.values()) {
            restore();
          }
          disposeTransactionSpecContext(editor, draftContext);
        } else {
          const draftValue = snapshot.builder.value as EditorDocumentValue;
          const draftRoots = {
            [MAIN_ROOT_KEY]: draftValue.children,
            ...(draftValue.roots ?? {}),
          } as Record<string, readonly Descendant[]>;
          const beforeValue = Object.freeze(
            getChangeValue(snapshot.roots)
          ) as EditorDocumentValue;
          const afterValue = Object.freeze(
            getChangeValue(draftRoots)
          ) as EditorDocumentValue;
          const canonicalChanges = snapshot.activeChange.change;
          const canonicalIndexes =
            snapshot.builder.indexedAfter(canonicalChanges);

          disposeTransactionSpecContext(editor, draftContext);

          withExtensionPublicationRollback(extensionPublication, () =>
            extensionPublication?.commit()
          );
          withExtensionPublicationRollback(extensionPublication, () =>
            profileCoreDuration('transaction-publish-draft', () =>
              publishTransactionDraft(editor, draftContext, draftRoots)
            )
          );
          profileCoreDuration('set-version', () =>
            setVersion(editor, snapshot.previousVersion + 1)
          );

          const previousSnapshot = snapshot.previousSnapshot;
          const beforeSnapshot =
            snapshot.childrenRoot === MAIN_ROOT_KEY
              ? previousSnapshot
              : getTransactionRootSnapshot(editor, snapshot, MAIN_ROOT_KEY);
          const mainRootChanged =
            !!getInternalDocumentRootChange(canonicalChanges, MAIN_ROOT_KEY) ||
            canonicalChanges.createRoots.has(MAIN_ROOT_KEY) ||
            canonicalChanges.deleteRoots.has(MAIN_ROOT_KEY);
          const afterSnapshot = profileCoreDuration(
            'transaction-after-snapshot',
            () =>
              mainRootChanged
                ? getCurrentRootSnapshot(
                    editor,
                    MAIN_ROOT_KEY,
                    beforeSnapshot,
                    snapshot.rootIndexes[MAIN_ROOT_KEY]
                  )
                : getSelectionOnlySnapshot(editor, beforeSnapshot)
          );

          profileCoreDuration('transaction-commit-snapshot', () => {
            setCachedSnapshot(editor, afterSnapshot, MAIN_ROOT_KEY);
            const retainedRoots = new Set([
              ...Object.keys(snapshot.baseSnapshots),
              ...Object.keys(snapshot.rootIndexes),
            ]);

            for (const root of retainedRoots) {
              if (root === MAIN_ROOT_KEY || !Object.hasOwn(draftRoots, root)) {
                continue;
              }
              const previousRootSnapshot = snapshot.baseSnapshots[root];
              const rootSnapshot = getCurrentRootSnapshot(
                editor,
                root,
                previousRootSnapshot,
                snapshot.rootIndexes[root] ?? previousRootSnapshot?.index
              );

              setCachedSnapshot(editor, rootSnapshot, root);
            }
            const committedRoots = {
              ...getEditorDocumentRoots(editor),
              [MAIN_ROOT_KEY]: afterSnapshot.children,
            } as Record<string, readonly Descendant[]>;

            ROOTS.set(editor, committedRoots);
            if (getCurrentChildrenRoot(editor) === MAIN_ROOT_KEY) {
              CHILDREN.set(editor, afterSnapshot.children);
            }
          });

          const selectionBefore = cloneValue(snapshot.selection);
          const selectionAfter = cloneValue(draftContext.selection);
          const change = profileCoreDuration('build-change', () =>
            createEditorCommit(
              {
                after: afterSnapshot,
                afterValue,
                annotations: Object.fromEntries(
                  [...snapshot.annotations].map(([key, entry]) => [
                    key,
                    entry.value,
                  ])
                ),
                before: beforeSnapshot,
                beforeValue,
                changes: canonicalChanges,
                dirtyStateKeys: [...snapshot.dirtyStateKeys],
                effects: [...snapshot.effects],
                editor,
                replace: snapshot.reason === 'replace',
                selectionAfter,
                selectionAfterRoot: draftContext.selectionRoot,
                selectionBefore,
                selectionBeforeRoot: snapshot.selectionRoot,
                selectionChanged:
                  !selectionPositionEquals(selectionBefore, selectionAfter) ||
                  snapshot.selectionRoot !== draftContext.selectionRoot,
                tags: [...snapshot.tags],
              },
              {
                previousVersion: snapshot.previousVersion,
                version: getVersion(editor),
              }
            )
          );
          committed = change;
          extensionPublication?.finalize();
          if (extensionPublication) {
            for (const staged of snapshot.extensionReconfigurations.values()) {
              staged.onPublished?.(extensionPublication.cleanup);
            }
          }
          const afterCommitHandlers =
            snapshot.afterCommitHandlers.length > 0
              ? materializeAfterCommitHandlers(
                  editor,
                  change,
                  snapshot.afterCommitHandlers
                )
              : [];

          profileCoreDuration('transaction-record-facets', () =>
            recordFacetCommit(editor, change)
          );
          profileCoreDuration('transaction-publish-anchors', () => {
            beginAnchorTransaction(editor);
            if (!canonicalChanges.empty) {
              notifyAnchorChanges(editor, canonicalChanges, canonicalIndexes, {
                replace: snapshot.reason === 'replace',
              });
            }
            commitAnchorTransaction(editor, undefined, change);
          });

          try {
            if (hasExtensionChangeListeners(editor)) {
              profileCoreDuration('notify-extension-change-listeners', () =>
                notifyEditorChangeListeners(
                  editor,
                  change,
                  beforeValue,
                  afterValue
                )
              );
            }
            profileCoreDuration('notify-listeners', () =>
              notifyListeners(editor, change)
            );
            profileCoreDuration('run-after-commit-handlers', () =>
              runAfterCommitHandlers(afterCommitHandlers)
            );
            profileCoreDuration('transaction-flush-post-commit', () =>
              flushPostCommitNotificationQueue(editor)
            );
          } finally {
            extensionPublication?.afterPublish();
          }
        }
      }
    }
  }

  return committed;
};

const createRootFitTransactionSpec = (
  editor: Editor,
  root: RootKey,
  input: import('../interfaces/editor').ContentSlice,
  selection?: NonNullable<Selection>
) => {
  let applicable = false;
  const spec = createTransactionSpec(editor, () => {
    applicable = getEditorSchema(editor).fit(input, {
      apply: (step, mappedSelection) =>
        applyDocumentChangeStep(
          editor,
          step,
          mappedSelection
            ? { selectionAfter: mappedSelection, selectionRoot: root }
            : {}
        ),
      builder: getActiveDocumentChangeBuilder(editor),
      target: {
        kind: 'root',
        root,
        ...(selection ? { selection } : {}),
      },
    });
  });

  if (!applicable) {
    const current = getActiveDocumentChangeBuilder(editor)
      .value as EditorDocumentValue;
    const candidate =
      root === MAIN_ROOT_KEY
        ? { ...current, children: input.content }
        : {
            ...current,
            roots: { ...(current.roots ?? {}), [root]: input.content },
          };

    getEditorSchema(editor).validateDocument(candidate as EditorDocumentValue);
    return createTransactionSpec(editor, () => {
      const builder = getActiveDocumentChangeBuilder(editor);
      const currentRoot =
        root === MAIN_ROOT_KEY
          ? (builder.value as EditorDocumentValue).children
          : ((builder.value as EditorDocumentValue).roots?.[root] ?? []);
      const step = builder.replaceChildren(
        root,
        [],
        0,
        currentRoot.length,
        input.content as Value
      );

      applyDocumentChangeStep(
        editor,
        step,
        selection ? { selectionAfter: selection, selectionRoot: root } : {}
      );
    });
  }

  return spec;
};

export const replaceSnapshot = (editor: Editor, input: SnapshotInput) => {
  runEditorTransaction(
    editor,
    () => {
      const snapshotInput =
        SNAPSHOT_INPUT_TRANSFORMS.get(getEditorRuntimeOwner(editor))?.(input) ??
        input;
      const transaction = getTransactionSnapshot(editor);
      const selectedRoot =
        getPublicExplicitRangeRoot(snapshotInput.selection) ?? MAIN_ROOT_KEY;
      const fitted = getEditorSchema(editor).fitDocument({
        children: snapshotInput.children as Value,
        ...(snapshotInput.meta === undefined
          ? {}
          : { meta: snapshotInput.meta }),
        ...(snapshotInput.roots === undefined
          ? {}
          : { roots: snapshotInput.roots as Record<RootKey, Value> }),
      });
      const representationSelection =
        snapshotInput.selection &&
        snapshotInput.selection !== 'start' &&
        snapshotInput.selection !== 'end'
          ? {
              ...snapshotInput.selection,
              anchor: stripLocationRoots(snapshotInput.selection.anchor),
              focus: stripLocationRoots(snapshotInput.selection.focus),
            }
          : null;
      const selectedInputChildren =
        selectedRoot === MAIN_ROOT_KEY
          ? snapshotInput.children
          : snapshotInput.roots?.[selectedRoot];
      const protectedInlineSpacerPaths = representationSelection
        ? getProtectedInlineSpacerEntries(editor, selectedInputChildren ?? [], [
            representationSelection.anchor,
            representationSelection.focus,
          ]).map(({ path }) => path)
        : [];
      if (transaction) {
        transaction.protectedInlineSpacerPaths.set(
          selectedRoot,
          protectedInlineSpacerPaths
        );
      }

      const fittedRoots: Record<string, readonly Descendant[]> = {
        [MAIN_ROOT_KEY]: fitted.children,
        ...(fitted.roots ?? {}),
      };
      const currentRoots = getEditorDocumentRoots(editor);

      for (const root of Object.keys(fittedRoots).sort((left, right) =>
        left === MAIN_ROOT_KEY
          ? -1
          : right === MAIN_ROOT_KEY
            ? 1
            : left.localeCompare(right)
      )) {
        const selectedSource =
          root === selectedRoot && selectedInputChildren
            ? selectedInputChildren
            : fittedRoots[root]!;

        applyTransactionSpec(
          editor,
          createRootFitTransactionSpec(
            editor,
            root,
            ContentSlice.closed(selectedSource),
            root === selectedRoot
              ? (representationSelection ?? undefined)
              : undefined
          )
        );
      }

      for (const root of Object.keys(currentRoots).sort()) {
        if (
          root !== MAIN_ROOT_KEY &&
          !Object.hasOwn(fittedRoots, root) &&
          Object.hasOwn(getEditorDocumentRoots(editor), root)
        ) {
          applyDocumentChangeStep(
            editor,
            getActiveDocumentChangeBuilder(editor).deleteRoot(root)
          );
        }
      }

      const fields = getStateFieldIdentityMap(editor);
      const nextMeta = Object.fromEntries(
        Object.entries(fitted.meta ?? {}).map(([key, value]) => {
          const field = fields.get(key);

          if (!field) return [key, cloneFrozen(value)];
          if (!field.persist) {
            throw new Error(
              `State field "${key}" cannot load persisted metadata without a codec.`
            );
          }

          return [key, cloneFrozen(field.deserialize(value))];
        })
      );

      for (const [key, field] of getStateFieldMap(editor)) {
        if (Object.hasOwn(nextMeta, key)) continue;
        const initial = resolveStateFieldInitial(field);

        if (initial !== undefined) nextMeta[key] = cloneFrozen(initial);
      }

      const previousMeta = getDocumentState(editor) ?? {};

      for (const key of new Set([
        ...Object.keys(previousMeta),
        ...Object.keys(nextMeta),
      ])) {
        setStateValueByKey(editor, key, nextMeta[key]);
      }

      if (transaction) {
        transaction.reason = 'replace';
      }

      const mappedInputSelection = representationSelection
        ? getCurrentSelection(editor)
        : snapshotInput.selection;

      withEditorUpdateRootScope(editor, selectedRoot, () =>
        setCurrentSelection(
          editor,
          resolveSnapshotSelection(editor, mappedInputSelection),
          selectedRoot
        )
      );
    },
    {
      authority: 'replace',
    }
  );
};

const resolveSnapshotSelection = (
  editor: Editor,
  selection: SnapshotSelectionInput | undefined
): Selection => {
  if (selection === 'start' || selection === 'end') {
    const point = readPointEdge(editor, [], selection);

    return point ? SelectionApi.text({ anchor: point, focus: point }) : null;
  }

  if (!selection) return null;

  const anchor = resolveSnapshotPoint(editor, selection.anchor);
  const focus = resolveSnapshotPoint(editor, selection.focus);

  return anchor && focus ? { ...selection, anchor, focus } : null;
};

const resolveSnapshotPoint = (editor: Editor, point: Point): Point | null => {
  try {
    const [node] = getNode(editor, point.path);

    if (NodeApi.isText(node)) {
      return {
        offset: Math.min(point.offset, node.text.length),
        path: point.path,
      };
    }
  } catch {}

  try {
    const edge = readPointEdge(editor, point.path, 'start');

    if (!edge) {
      return null;
    }

    const [node] = getNode(editor, edge.path);

    if (NodeApi.isText(node)) {
      return {
        offset: Math.min(point.offset, node.text.length),
        path: edge.path,
      };
    }

    return edge;
  } catch {}

  try {
    return readPointEdge(editor, [], 'start') ?? null;
  } catch {}

  return null;
};

const CORE_STATE_VIEWS = new WeakMap<object, EditorCoreStateView<any>>();

/** @internal Remove transaction and extension groups from a public state view. */
export const toEditorCoreStateView = <V extends Value>(
  state: EditorCoreStateView<V>
): EditorCoreStateView<V> => {
  const cached = CORE_STATE_VIEWS.get(state);

  if (cached) return cached as EditorCoreStateView<V>;

  const core = Object.freeze({
    children: state.children,
    facet: state.facet,
    fragment: state.fragment,
    getField: state.getField,
    lastCommit: state.lastCommit,
    marks: state.marks,
    meta: state.meta,
    nodes: state.nodes,
    points: state.points,
    ranges: state.ranges,
    root: state.root,
    runtime: state.runtime,
    schema: state.schema,
    selection: state.selection,
    slice: state.slice,
    text: state.text,
    value: state.value,
    view: state.view,
  }) satisfies EditorCoreStateView<V>;

  CORE_STATE_VIEWS.set(state, core);

  return core;
};

export const initializePublicState = <
  V extends Value,
  TExtensions extends readonly unknown[] = readonly [],
>(
  editor: Editor<V, TExtensions>,
  options: CreateEditorOptions<V, TExtensions> = {}
) => {
  const initialValue = normalizeEditorValue(options.initialValue);
  const initialChildren = cloneFrozen(initialValue.children);
  const initialRoots = cloneFrozen(initialValue.roots);

  if (!NodeApi.isNodeList(initialChildren)) {
    throw new Error(
      '[Plite] initialValue is invalid! Expected a list of elements.'
    );
  }

  for (const [key, children] of Object.entries(initialRoots)) {
    if (!NodeApi.isNodeList(children)) {
      throw new Error(
        `[Plite] initialValue.roots.${key} is invalid! Expected a list of elements.`
      );
    }
  }

  CHILDREN.set(editor, initialChildren);
  ROOTS.set(editor, initialRoots);
  CURRENT_CHILDREN_ROOT.set(editor, MAIN_ROOT_KEY);
  DOCUMENT_STATE.set(editor, initialValue.meta);
  EDITOR_COMPOSING.set(editor, false);
  EDITOR_FOCUSED.set(editor, false);
  setEditorDefaultBlockType(editor, options.defaultBlockType);
  setEditorMaxLength(editor, options.maxLength);
  EDITOR_READ_ONLY.set(editor, options.readOnly ?? false);
  seedRuntimeIds(initialChildren, editor);
  for (const children of Object.values(initialRoots)) {
    seedRuntimeIds(children, editor);
  }
  const initialSelectionRoot =
    getPublicExplicitRangeRoot(options.initialSelection) ?? MAIN_ROOT_KEY;
  initializeSelectionState(
    editor,
    options.initialSelection ?? null,
    initialSelectionRoot
  );
  initializeListenerState(editor);
  LAST_COMMIT.set(editor, null);
  initializeStateFieldMap(editor);
  initializeVersionState(editor);
  clearSnapshotCache(editor);

  return Object.freeze({ explicit: initialValue.explicit });
};

export const initializeEditorSchemaDocument = (
  editor: Editor,
  value: EditorDocumentValue
) => {
  const document = cloneFrozenEditorJsonValue(value);
  const roots = {
    [MAIN_ROOT_KEY]: document.children,
    ...(document.roots ?? {}),
  } as Record<string, readonly Descendant[]>;

  CHILDREN.set(editor, roots[MAIN_ROOT_KEY]!);
  ROOTS.set(editor, roots);
  CURRENT_CHILDREN_ROOT.set(editor, MAIN_ROOT_KEY);
  if (document.meta === undefined) DOCUMENT_STATE.delete(editor);
  else DOCUMENT_STATE.set(editor, document.meta);
  for (const children of Object.values(roots)) seedRuntimeIds(children, editor);
  clearSnapshotCache(editor);
};
