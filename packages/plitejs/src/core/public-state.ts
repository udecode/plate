import { applyAddMark } from '../editor/add-mark';
import { correctDocument } from '../editor/correct-document';
import { applyDelete } from '../editor/delete-backward';
import { applyDeleteFragment } from '../editor/delete-fragment';
import { applyInsertBreak } from '../editor/insert-break';
import { applyInsertSoftBreak } from '../editor/insert-soft-break';
import { applyInsertTextCommand } from '../editor/insert-text';
import { node as getNode } from '../editor/node';
import { nodes as getNodes } from '../editor/nodes';
import { applyRemoveMark } from '../editor/remove-mark';
import { applyToggleMark } from '../editor/toggle-mark';
import type {
  CreateEditorOptions,
  AnyEditor as Editor,
  EditorCommit,
  EditorCommitContext,
  EditorCommitHandler,
  EditorCommand,
  EditorCoreStateView,
  EditorCoreUpdateTransaction,
  EditorDocumentValue,
  EditorEffect,
  EditorEffectType,
  PluginInput,
  PluginReference,
  PluginReconfigureOptions,
  EditorLeafOptions,
  EditorMarks,
  EditorNodeGetOptions,
  EditorNodesReadOptions,
  EditorNodesOptions,
  EditorParentOptions,
  EditorPathOptions,
  EditorPointOptions,
  EditorCorrectionTransaction,
  EditorSnapshot,
  EditorSelectionBlockOptions,
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
  PersistedDocumentInput,
  RootKey,
  NodeKey,
  Selection,
  SnapshotIndex,
  SnapshotInput,
  SnapshotSelectionInput,
  StateFieldTransition,
  StateFieldValueInput,
  TransactionSpec,
  Value,
} from '../interfaces/editor';
import {
  ElementApi,
  type Element,
  type ElementIn,
  type ElementOrTextIn,
} from '../interfaces/element';
import { LocationApi, type Location, type Span } from '../interfaces/location';
import {
  type Ancestor,
  type Descendant,
  type DescendantIn,
  NodeApi,
  type NodeIn,
  type NodeMatch,
  type NodeMatchPredicate,
  type NodeTypeSelector,
  type NodeEntry,
  type Node as PliteNode,
} from '../interfaces/node';
import { type Path, PathApi } from '../interfaces/path';
import { type Point, PointApi } from '../interfaces/point';
import { type Range, RangeApi } from '../interfaces/range';
import type {
  EditorSchemaIdentity,
  SchemaPropertyHandle,
} from '../interfaces/schema';
import {
  type NodeSelection,
  SelectionApi,
  type SelectionValue,
} from '../interfaces/selection';
import type { Text } from '../interfaces/text';
import type {
  BlockDuplicateOptions,
  NodeDuplicateOptions,
  NodeInsertNodesOptions,
  NodeUnsetNodesOptions,
} from '../interfaces/transforms/node';
import { getDefined } from '../internal/get-defined';
import { stripLocationRoots } from '../internal/root-location';
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
} from '../transforms-selection';
import { deleteText } from '../transforms-text';
import type { MaximizeMode } from '../types/types';
import { getDefaultInsertLocation } from '../utils';
import {
  getNodeKeyForNode,
  getOrCreateNodeKey,
  inheritNodeKey,
  inheritNodeKeys,
  seedNodeKeys,
} from '../utils/node-keys';
import { normalizeNodeMatch } from '../utils/node-match';
import { createAnchor } from './anchor';
import {
  beginAnchorTransaction,
  clearStagedAnchorHistory,
  commitAnchorTransaction,
  enterAnchorScope,
  notifyAnchorChanges,
  prepareAnchorPublication,
  suspendAnchorScopes,
} from './anchor-state';
import {
  beginAuthoredTransaction,
  updateAuthoredComposition,
  prepareAuthoredViewUpdate,
  withAuthoredViewRead,
  withAuthoredDocumentReplacement,
  shouldEmitAuthoredEffect,
  type NativeAuthoredTransaction,
} from './authored-runtime';
import { notifyEditorChangeListeners } from './change-events';
import { ChangeDraft, type DocumentChangeStep } from './change/builder';
import {
  classifyDocumentChangeRoot,
  classifyRootChangeWithRuntimeCandidates,
  getDocumentChangeAfterPaths,
  getDocumentChangeTopLevelRanges,
} from './change/classification';
import {
  getInternalDocumentChangeClassification,
  getInternalDocumentChangeEntries,
  getInternalDocumentRootChange,
  DocumentChange,
} from './change/document-change';
import { DocumentIndex } from './change/document-index';
import type { JsonEditorValue } from './change/tokens';
import { cloneFrozen, cloneValue, freezeOwnedJsonValue } from './clone';
import { createEditorCommit } from './commit';
import { ContentSlice } from './content-slice';
import { rewriteContentRootReferences } from './content-slice-roots';
import { editorCommands } from './editor-commands';
import {
  isEditorNodeSelectable,
  projectEditorExportSlice,
  projectEditorGetSlice,
} from './editor-read-execution';
import {
  getEditorRuntime,
  getEditorRuntimeOwner,
  getEditorRuntimeRoot,
  getEditorSchema,
  type InternalPluginPublicationEntry,
  type InternalEditorRuntime,
} from './editor-runtime';
import type { InternalEditorSchemaApi } from './editor-schema';
import { getContentSlice } from './get-content-slice';
import { getFragment } from './get-fragment';
import { normalizeEditorValue } from './initial-value';
import {
  limitNodeInsert,
  limitSliceInsert,
  limitTextInsert,
} from './insert-limit';
import { reportEditorLifecycleError } from './lifecycle-error';
import {
  getCommitListeners,
  getSnapshotListeners,
  getSourceListeners,
  getSourcesForChange,
  initializeListenerState,
} from './listener-state';
import { normalizeNodeUnsetInput } from './node-property-mutation';
import {
  assertPluginPublicationInactive,
  type PluginRegistry,
  getPluginRegistry,
  hasChangeListeners as hasPluginChangeListeners,
} from './plugin-registry';
import { profileCoreDuration } from './profiling';
import {
  assertPublicLocationRoot,
  assertPublicRootKey,
  getPublicExplicitLocationRoot,
  getReadLocationRoot,
  MAIN_ROOT_KEY,
  requireMutableRoot,
  toInternalRoot,
  toPublicRoot,
  usesImplicitSelectionLocation,
} from './public-root';
import {
  canonicalizeRootChildren,
  constructCanonicalDocumentChange,
  getProtectedInlineSpacerEntries,
} from './representation';
import { EditorSchemaValidationError } from './schema-validation';
import {
  assertSelectionSupported,
  getSelectionRange,
  getSelectionRanges,
  isValidEditorSelection,
  mapSelectionThroughChange,
} from './selection-protocol';
import {
  getSelectionStateRoot,
  getSelectionStateSelection,
  initializeSelectionState,
  setSelectionStateSelection,
} from './selection-state';
import { defineSemanticUpdateMethod } from './semantic-update-method';
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
  createEditorEffect,
  defineUpdateAnnotation,
  mapEffect,
} from './transaction-values';
import { copyTxMethodMarkers, isTxOnlyMethod, isTxReadMethod } from './tx-only';
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
import {
  areEditorJsonValuesEqual,
  cloneFrozenEditorJsonValue,
  snapshotEditorJsonValue,
} from './value-codec';

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

type AnyPluginEditor = Editor;

export type TransactionAuthority = 'explicit' | 'replace' | 'update';

type TransactionSnapshot = {
  viewChanged?: boolean;
  publicationBase?: Pick<
    TransactionSnapshot,
    | 'baseRuntimeIndexes'
    | 'baseSnapshots'
    | 'previousSnapshot'
    | 'roots'
    | 'selection'
    | 'selectionRoot'
  >;
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
  discardedNodeKeys: Set<NodeKey>;
  dirtyStateKeys: Set<string>;
  scopedAnchors: Set<{ release: () => unknown }>;
  effects: EditorEffect[];
  pluginReconfigurations: Map<
    string,
    Readonly<{
      editor?: Editor;
      input: PluginInput;
      migrate?: PluginReconfigureOptions['migrate'];
      onPublished?: (cleanup: () => void) => void;
    }>
  >;
  rootIndexes: Record<string, SnapshotIndex>;
  roots: Record<string, readonly Descendant[]>;
  tags: Set<EditorUpdateTag>;
  transactionChangeObservers: Set<
    import('../interfaces/editor').EditorTransactionChangeHandler<Editor>
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
  handler: EditorCommitHandler<Editor>;
  root: string;
};

type MaterializedAfterCommitHandler = {
  context: EditorCommitContext<Editor>;
  handler: EditorCommitHandler<Editor>;
};

const CHILDREN = new WeakMap<Editor, readonly Descendant[]>();
export const documentReplacement = defineUpdateAnnotation<boolean>({
  key: 'document.replace',
});
const ROOTS = new WeakMap<
  Editor,
  Readonly<Record<string, readonly Descendant[]>>
>();
const DOCUMENT_STATE = new WeakMap<
  Editor,
  Record<string, unknown> | undefined
>();
const EDITOR_COMPOSING = new WeakMap<AnyPluginEditor, boolean>();
const EDITOR_FOCUSED = new WeakMap<AnyPluginEditor, boolean>();
const EDITOR_MAX_LENGTH = new WeakMap<AnyPluginEditor, number | undefined>();
const EDITOR_READ_ONLY = new WeakMap<AnyPluginEditor, boolean>();
type EditorViewStateChange = 'authored' | 'composing' | 'focused' | 'readOnly';
const EDITOR_VIEW_STATE_LISTENERS = new WeakMap<
  object,
  Set<(change: EditorViewStateChange) => void>
>();
const LAST_COMMIT = new WeakMap<Editor, EditorCommit | null>();
const SNAPSHOT_CACHE = new WeakMap<Editor, Map<string, EditorSnapshot>>();
const READ_PROJECTIONS = new WeakMap<Editor, EditorDocumentValue>();
const READ_SELECTIONS = new WeakMap<
  Editor,
  Readonly<{ selection: Selection; root: string }>
>();
const PROJECTION_SNAPSHOTS = new WeakMap<
  EditorDocumentValue,
  Map<string, EditorSnapshot>
>();
const PROJECTION_INDEXES = new WeakMap<
  Editor,
  WeakMap<readonly Descendant[], SnapshotIndex>
>();

const projectionIndexes = (editor: Editor) => {
  const owner = getEditorRuntimeOwner(editor);
  let indexes = PROJECTION_INDEXES.get(owner);
  if (!indexes) {
    indexes = new WeakMap();
    PROJECTION_INDEXES.set(owner, indexes);
  }
  return indexes;
};

export const getEditorProjectionSnapshotIndex = (
  editor: Editor,
  children: readonly Descendant[]
): SnapshotIndex => {
  const indexes = projectionIndexes(editor);
  let index = indexes.get(children);
  if (!index) {
    index = buildSnapshotIndex(getEditorRuntimeOwner(editor), children);
    indexes.set(children, index);
  }
  return index;
};

export const inheritEditorProjectionIndexes = (
  editor: Editor,
  before: EditorDocumentValue,
  after: EditorDocumentValue,
  change: DocumentChange,
  discardedNodeKeys: ReadonlySet<NodeKey> = new Set()
) => {
  const indexes = projectionIndexes(editor);
  const owner = getEditorRuntimeOwner(editor);
  for (const [root, rootChange] of getInternalDocumentChangeEntries(change)) {
    const previous =
      root === MAIN_ROOT_KEY ? before.children : (before.roots?.[root] ?? []);
    const next =
      root === MAIN_ROOT_KEY ? after.children : (after.roots?.[root] ?? []);
    const index = indexes.get(previous);
    if (!index || previous === next || indexes.has(next)) continue;
    const beforeDocument = DocumentIndex.fromValue(previous);
    const afterDocument = DocumentIndex.fromValue(next);
    const classified = classifyRootChangeWithRuntimeCandidates(
      rootChange,
      beforeDocument,
      afterDocument
    );
    const classification =
      getInternalDocumentChangeClassification(change, root) ??
      classified.classification;
    const changesElementType =
      classification.properties &&
      classification.paths.some((path) => {
        try {
          const beforeNode = beforeDocument.node(path);
          const afterNode = afterDocument.node(path);

          return (
            ('children' in beforeNode ? beforeNode.type : undefined) !==
            ('children' in afterNode ? afterNode.type : undefined)
          );
        } catch {
          return false;
        }
      });
    const pathStable =
      !classification.structure &&
      !changesElementType &&
      discardedNodeKeys.size === 0;

    indexes.set(
      next,
      pathStable
        ? advancePathStableSnapshotIndex(
            beforeDocument,
            afterDocument,
            rootChange,
            index,
            owner,
            classified.runtimeCandidates
          )
        : mapSnapshotIndexThroughChange(
            beforeDocument,
            afterDocument,
            rootChange,
            index,
            owner,
            discardedNodeKeys
          )
    );
  }
};

export const withEditorDocumentProjection = <T>(
  editor: Editor,
  value: EditorDocumentValue | undefined,
  read: () => T,
  selection?: Readonly<{ selection: Selection; root: string }>
): T => {
  const owner = getEditorRuntimeOwner(editor);
  const previous = READ_PROJECTIONS.get(owner);
  const previousSelection = READ_SELECTIONS.get(owner);
  if (value) READ_PROJECTIONS.set(owner, value);
  else READ_PROJECTIONS.delete(owner);
  if (selection) READ_SELECTIONS.set(owner, selection);
  else READ_SELECTIONS.delete(owner);
  try {
    return read();
  } finally {
    if (previous) READ_PROJECTIONS.set(owner, previous);
    else READ_PROJECTIONS.delete(owner);
    if (previousSelection) READ_SELECTIONS.set(owner, previousSelection);
    else READ_SELECTIONS.delete(owner);
  }
};
const SNAPSHOT_INPUT_TRANSFORMS = new WeakMap<
  Editor,
  (input: SnapshotInput) => SnapshotInput
>();
const TRANSACTION_VIEW_TRANSFORMS = new WeakMap<
  Editor,
  (transaction: Record<string, unknown>) => void
>();
const STATE_VIEW_TRANSFORMS = new WeakMap<
  Editor,
  (state: Record<string, unknown>) => void
>();
const STATE_VIEW_TRANSFORM_GENERATIONS = new WeakMap<Editor, number>();
const STATE_VIEW_CACHE = new WeakMap<
  Editor,
  {
    registry: PluginRegistry;
    transformGeneration: number;
    view: EditorStateView;
  }
>();
const CONSTRUCTING_STATE_VIEWS = new WeakSet<Editor>();

const incrementStateViewTransformGeneration = (editor: Editor) => {
  STATE_VIEW_TRANSFORM_GENERATIONS.set(
    editor,
    (STATE_VIEW_TRANSFORM_GENERATIONS.get(editor) ?? 0) + 1
  );
};

/**
 * Install one host-owned transform before external snapshot fitting.
 *
 * @internal
 */
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

/**
 * Install one host-owned projection before a transaction view freezes.
 *
 * @internal
 */
export const setEditorTransactionViewTransform = (
  editor: Editor,
  transform: ((transaction: Record<string, unknown>) => void) | undefined
) => {
  const owner = getEditorRuntimeOwner(editor);
  const previous = TRANSACTION_VIEW_TRANSFORMS.get(owner);

  if (transform) {
    TRANSACTION_VIEW_TRANSFORMS.set(owner, transform);
  } else {
    TRANSACTION_VIEW_TRANSFORMS.delete(owner);
  }

  return () => {
    if (TRANSACTION_VIEW_TRANSFORMS.get(owner) !== transform) return;

    if (previous) {
      TRANSACTION_VIEW_TRANSFORMS.set(owner, previous);
    } else {
      TRANSACTION_VIEW_TRANSFORMS.delete(owner);
    }
  };
};

/**
 * Install one host-owned projection before a state view freezes.
 *
 * @internal
 */
export const setEditorStateViewTransform = (
  editor: Editor,
  transform: ((state: Record<string, unknown>) => void) | undefined
) => {
  const owner = getEditorRuntimeOwner(editor);
  const previous = STATE_VIEW_TRANSFORMS.get(owner);

  if (transform) {
    STATE_VIEW_TRANSFORMS.set(owner, transform);
  } else {
    STATE_VIEW_TRANSFORMS.delete(owner);
  }
  incrementStateViewTransformGeneration(owner);

  return () => {
    if (STATE_VIEW_TRANSFORMS.get(owner) !== transform) return;

    if (previous) {
      STATE_VIEW_TRANSFORMS.set(owner, previous);
    } else {
      STATE_VIEW_TRANSFORMS.delete(owner);
    }
    incrementStateViewTransformGeneration(owner);
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

type EditorTransactionGuard = (context: {
  readonly after: EditorDocumentValue;
  readonly before: EditorDocumentValue;
  readonly change: DocumentChange;
  readonly effects: readonly EditorEffect[];
  readonly commit: EditorCommit;
  readonly schema: EditorSchemaIdentity;
}) => void | (() => void);

const TRANSACTION_GUARDS = new WeakMap<Editor, Set<EditorTransactionGuard>>();
const PREPARING_COMMIT = new WeakSet<Editor>();

export type EditorHistoryReplayReceipt = Readonly<{
  group: object;
  version: number;
}>;

type EditorHistoryRuntime = Readonly<{
  head: (direction: 'redo' | 'undo') => object | null;
}>;

const EDITOR_HISTORY_RUNTIMES = new WeakMap<Editor, EditorHistoryRuntime>();
const EDITOR_HISTORY_REPLAY_RECEIPTS = new WeakMap<
  object,
  EditorHistoryReplayReceipt
>();

/** Register the private history identity bridge used by mounted editor views. */
export const registerEditorHistoryRuntime = (
  editor: Editor,
  runtime: EditorHistoryRuntime
) => {
  const owner = getEditorRuntimeOwner(editor);
  const previous = EDITOR_HISTORY_RUNTIMES.get(owner);

  EDITOR_HISTORY_RUNTIMES.set(owner, runtime);

  return () => {
    if (EDITOR_HISTORY_RUNTIMES.get(owner) !== runtime) return;
    if (previous) EDITOR_HISTORY_RUNTIMES.set(owner, previous);
    else EDITOR_HISTORY_RUNTIMES.delete(owner);
  };
};

/** Read the private logical identity of the next replay batch. */
export const readEditorHistoryHeadIdentity = (
  editor: Editor,
  direction: 'redo' | 'undo'
) =>
  EDITOR_HISTORY_RUNTIMES.get(getEditorRuntimeOwner(editor))?.head(direction) ??
  null;

/** Attach private mounted-view metadata to an applied replay result. */
export const recordEditorHistoryReplayReceipt = (
  result: object,
  receipt: EditorHistoryReplayReceipt
) => {
  EDITOR_HISTORY_REPLAY_RECEIPTS.set(result, receipt);
};

/** Read private mounted-view metadata from an applied replay result. */
export const readEditorHistoryReplayReceipt = (result: object) =>
  EDITOR_HISTORY_REPLAY_RECEIPTS.get(result);

const getTransactionSpecContext = (editor: Editor) =>
  TRANSACTION_SPEC_CONTEXTS.get(editor)?.at(-1);

const getReadProjection = (editor: Editor) => {
  const owner = getEditorRuntimeOwner(editor);
  // A finalized draft cannot be edited; reads can use its prepared view projection.
  return !getTransactionSpecContext(owner) || PREPARING_COMMIT.has(owner)
    ? READ_PROJECTIONS.get(owner)
    : undefined;
};

export const markTransactionSelectionWritten = (editor: Editor) => {
  const context = getTransactionSpecContext(editor);
  if (context) context.selectionWritten = true;
};

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

/**
 * Final semantic tags visible to the active command layer.
 *
 * @internal
 */
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

const closeScopedTransactionAnchors = (snapshot: TransactionSnapshot) => {
  snapshot.token.active = false;
  for (const anchor of snapshot.scopedAnchors) anchor.release();
  snapshot.scopedAnchors.clear();
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

export const snapshotInitialDocumentState = (editor: Editor) => {
  const state = getDocumentState(editor);

  if (state) {
    setDocumentState(
      editor,
      snapshotEditorJsonValue(state, '[Plite] initialValue.meta')
    );
  }
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
const TRANSACTION_SPEC_AFTER_COMMIT_HANDLERS = new WeakMap<
  TransactionSpec,
  readonly TransactionAfterCommitHandler[]
>();
const PREPARED_TRANSACTION_SPECS = new WeakMap<
  TransactionSpec,
  Readonly<{
    deferValidation: boolean;
    discardedNodeKeys: ReadonlySet<NodeKey>;
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
        void Promise.resolve().then(callback);
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
  getActiveUpdateRoot(getEditorRuntimeOwner(editor)) ??
  getEditorRuntimeRoot(editor);

export const isInTransaction = (editor: Editor) =>
  getEditorTransactionDepth(editor) > 0;

export const getEditorReadDepth = (editor: Editor) =>
  READ_DEPTH.get(editor) ?? 0;

export const getEditorTransactionDepth = (editor: Editor) =>
  getTransactionSpecContext(editor)?.depth ??
  TRANSACTION_DEPTH.get(editor) ??
  0;

/** Register an internal acceptance guard that runs before a draft publishes. */
export const registerEditorTransactionGuard = (
  editor: Editor,
  guard: EditorTransactionGuard
) => {
  const owner = getEditorRuntimeOwner(editor);
  const guards = TRANSACTION_GUARDS.get(owner) ?? new Set();

  guards.add(guard);
  TRANSACTION_GUARDS.set(owner, guards);
  let active = true;

  return () => {
    if (!active) return;

    active = false;
    guards.delete(guard);
    if (guards.size === 0) TRANSACTION_GUARDS.delete(owner);
  };
};

/** Reject an external side effect while an editor transaction is speculative. */
export const assertEditorExternalMutationAllowed = (editor: Editor): void => {
  if (getEditorTransactionDepth(getEditorRuntimeOwner(editor)) > 0) {
    throw new Error(
      'Yjs API mutations cannot run inside an editor update or transaction spec.'
    );
  }
};

const runEditorTransactionGuards = (
  guards: readonly EditorTransactionGuard[],
  before: EditorDocumentValue,
  after: EditorDocumentValue,
  change: DocumentChange,
  effects: readonly EditorEffect[],
  commit: EditorCommit,
  schema: EditorSchemaIdentity
) => {
  const publications: Array<() => void> = [];
  for (const guard of guards) {
    const publish = guard({ after, before, change, effects, commit, schema });
    if (publish) publications.push(publish);
  }
  return publications;
};

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
  assertPluginPublicationInactive(editor);

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
  const persistentMetaKeys = Object.keys(meta ?? {}).filter((key) => {
    const field = fields.get(key);

    return !field || field.persist;
  });
  const hasExtraRoots = Object.keys(extraRoots).length > 0;
  const hasPersistentMeta = persistentMetaKeys.length > 0;
  const persistentMeta = hasPersistentMeta
    ? (() => {
        const result: Record<string, unknown> = {};

        // State codecs can be much larger than the visible document. Resolve
        // each immutable field only if persisted metadata is actually read.
        for (const key of persistentMetaKeys) {
          const field = fields.get(key);
          const item = meta?.[key];
          let encoded: unknown;
          let resolved = false;

          Object.defineProperty(result, key, {
            enumerable: true,
            get: () => {
              if (!resolved) {
                encoded = field ? field.serialize(item) : cloneFrozen(item);
                resolved = true;
              }

              return encoded;
            },
          });
        }

        return freezeOwnedJsonValue(result);
      })()
    : undefined;
  // Canonical callers already own frozen arrays; rechecking scans every slot.
  return Object.freeze({
    children: mainChildren,
    ...(persistentMeta ? { meta: persistentMeta } : {}),
    ...(hasExtraRoots ? { roots: Object.freeze(extraRoots) } : {}),
  });
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
  options: { at?: Location | NodeSelection | Span } | undefined,
  fn: () => T,
  queryOptions?: { selectionFallback?: boolean }
): T => {
  if (SelectionApi.isNode(options?.at)) {
    return withEditorRootChildren(editor, options.at.root ?? MAIN_ROOT_KEY, fn);
  }

  return withLocationRootRead(editor, options?.at, fn, queryOptions);
};

const withOptionsRootGenerator = <T>(
  editor: Editor,
  options: { at?: Location | NodeSelection | Span } | undefined,
  create: () => Iterable<T>,
  queryOptions?: { selectionFallback?: boolean }
): Generator<T, void, undefined> =>
  (function* rootedReadGenerator() {
    if (SelectionApi.isNode(options?.at)) {
      yield* withEditorRootChildrenGenerator(
        editor,
        options.at.root ?? MAIN_ROOT_KEY,
        create
      );
      return;
    }

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
  options: { at?: Location | NodeSelection | Span } | undefined
): boolean =>
  options?.at === undefined ||
  SelectionApi.isNode(options.at) ||
  hasLocationPath(editor, options.at);

const readNodeEntry = <T extends PliteNode>(
  editor: Editor,
  at: Location
): NodeEntry<T> | undefined => {
  if (!hasLocationPath(editor, at)) return undefined;

  return getNode(editor, at) as NodeEntry<T>;
};

const readNodePath = (
  editor: Editor,
  at: Location,
  options: EditorPathOptions = {}
): Path | undefined => {
  if (!hasLocationPath(editor, at)) return undefined;

  const path = getEditorRuntime(editor).path(at, options);
  assertPathShape(path);

  if (NodeApi.has(editor, path)) return path;

  return undefined;
};

const resolveNodeTargetLocation = (
  editor: Editor,
  target: NodeTarget
): Location | undefined => {
  if (typeof target === 'string') {
    return getPathByNodeKey(editor, target) ?? undefined;
  }

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
    const location = target as Location;

    assertLocationPathShape(location);
    return location;
  }

  const nodeKey = getNodeKeyForNode(target, getEditorRuntimeOwner(editor));

  return nodeKey ? (getPathByNodeKey(editor, nodeKey) ?? undefined) : undefined;
};

const resolveReadableNodeTarget = (
  editor: Editor,
  target: NodeTarget
): Location | undefined => resolveNodeTargetLocation(editor, target);

type NodeTargetOptions = { at?: NodeTarget };

const getOptionsNodeTarget = (options: object | undefined) =>
  options && 'at' in options ? (options as NodeTargetOptions).at : undefined;

const getRuntimeTargetRoot = (
  editor: Editor,
  nodeKey: NodeKey
): string | undefined => {
  for (const root of new Set([
    getCurrentChildrenRoot(editor),
    MAIN_ROOT_KEY,
    ...getEditorRuntimeRootKeys(editor),
  ])) {
    const path = withEditorRootChildren(editor, root, () =>
      getPathByNodeKey(editor, nodeKey)
    );

    if (path) return root;
  }

  return undefined;
};

const getNodeTargetRoot = (editor: Editor, target: NodeTarget | undefined) => {
  if (typeof target === 'string') {
    return getRuntimeTargetRoot(editor, target);
  }

  return undefined;
};

const getSelectionNodeTargetRoot = (
  editor: Editor,
  target: Descendant | NodeKey
) => {
  if (typeof target === 'string') return getRuntimeTargetRoot(editor, target);

  const nodeKey = getNodeKeyForNode(target, getEditorRuntimeOwner(editor));

  return nodeKey ? getRuntimeTargetRoot(editor, nodeKey) : undefined;
};

const withNodeTargetRootRead = <T>(
  editor: Editor,
  target: NodeTarget | undefined,
  fn: () => T
): T => {
  const root = getNodeTargetRoot(editor, target);

  return root ? withEditorRootChildren(editor, root, fn) : fn();
};

const withNodeTargetRootGenerator = <T>(
  editor: Editor,
  target: NodeTarget | undefined,
  create: () => Iterable<T>
) => {
  const root = getNodeTargetRoot(editor, target);

  return root
    ? withEditorRootChildrenGenerator(editor, root, create)
    : (function* unscopedNodeTargetGenerator() {
        yield* create();
      })();
};

const localizeLocation = (location: Location): Location =>
  LocationApi.isPath(location) ? location : stripLocationRoots(location);

type NodeMatchOptions = {
  match?: NodeMatch;
  type?: import('../interfaces/node').NodeTypeSelector;
};

type NormalizedNodeMatchOptions<TOptions extends object> = Omit<
  TOptions,
  'match' | 'type'
> & {
  match?: NodeMatchPredicate;
};

type ResolvedNodeTargetOptions<TOptions extends NodeTargetOptions> = Omit<
  NormalizedNodeMatchOptions<TOptions>,
  'at'
> & {
  at?: Location;
};

const normalizeNodeMatchOption = <TOptions extends object>(
  options: TOptions
): NormalizedNodeMatchOptions<TOptions> => {
  if (!('match' in options) && !('type' in options)) {
    return options;
  }

  const {
    match: optionMatch,
    type,
    ...rest
  } = options as TOptions & NodeMatchOptions;
  const match = normalizeNodeMatch(type, optionMatch);

  return { ...rest, match };
};

const resolveNodeTargetOptions = <TOptions extends NodeTargetOptions>(
  editor: Editor,
  options: TOptions | undefined
): null | ResolvedNodeTargetOptions<TOptions> | undefined => {
  if (!options || options.at === undefined) {
    return options
      ? (normalizeNodeMatchOption(
          options
        ) as ResolvedNodeTargetOptions<TOptions>)
      : undefined;
  }

  const at = resolveNodeTargetLocation(editor, options.at);

  if (at === undefined) return null;

  return normalizeNodeMatchOption({
    ...options,
    at,
  });
};

type NodeTargetOrSpanOptions = {
  at?: NodeSelection | NodeTarget | Span;
};

type ResolvedNodeTargetOrSpanOptions<TOptions extends NodeTargetOrSpanOptions> =
  Omit<NormalizedNodeMatchOptions<TOptions>, 'at'> & {
    at?: Location | NodeSelection | Span;
  };

const resolveNodeTargetOrSpanOptions = <
  TOptions extends NodeTargetOrSpanOptions,
>(
  editor: Editor,
  options: TOptions | undefined
): null | ResolvedNodeTargetOrSpanOptions<TOptions> | undefined => {
  if (!options || options.at === undefined) {
    return options
      ? (normalizeNodeMatchOption(
          options
        ) as ResolvedNodeTargetOrSpanOptions<TOptions>)
      : undefined;
  }
  if (SelectionApi.isNode(options.at)) {
    return normalizeNodeMatchOption(
      options
    ) as ResolvedNodeTargetOrSpanOptions<TOptions>;
  }
  if (LocationApi.isSpan(options.at as Location | Span)) {
    return normalizeNodeMatchOption(
      options
    ) as ResolvedNodeTargetOrSpanOptions<TOptions>;
  }

  const at = resolveNodeTargetLocation(editor, options.at as NodeTarget);

  if (at === undefined) return null;

  return normalizeNodeMatchOption({
    ...options,
    at,
  });
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
  if (!hasLocationPath(editor, at)) return undefined;

  return getEditorRuntime(editor).first(at);
};

const readNodeLeaf = (
  editor: Editor,
  at: Location,
  options: EditorLeafOptions = {}
): NodeEntry<Text> | undefined => {
  if (!hasLocationPath(editor, at)) return undefined;

  return getEditorRuntime(editor).leaf(at, options);
};

const readNodeParent = (
  editor: Editor,
  at: Location,
  options: EditorParentOptions = {}
): NodeEntry<Ancestor> | undefined => {
  if (PathApi.isPath(at) && at.length === 0) return undefined;

  if (!hasLocationPath(editor, at)) return undefined;

  const { match: _match, type: _type, ...pathOptions } = options;

  return getEditorRuntime(editor).parent(at, pathOptions);
};

const readPoint = (
  editor: Editor,
  at: Location,
  options: EditorPointOptions = {}
): Point | undefined => {
  if (!hasLocationPath(editor, at)) return undefined;
  const runtime = getEditorRuntime(editor);

  if (PathApi.isPath(at)) {
    const edgeEntry =
      options.edge === 'end' ? runtime.last(at) : runtime.first(at);

    if (!edgeEntry || !NodeApi.isText(edgeEntry[0])) return undefined;
  }

  return runtime.point(at, options);
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
    return undefined;
  }

  return direction === 'after'
    ? getEditorRuntime(editor).after(at, options)
    : getEditorRuntime(editor).before(at, options);
};

const readRangeEdges = (
  editor: Editor,
  at: Location
): readonly [Point, Point] | undefined => {
  if (!hasLocationPath(editor, at)) return undefined;

  return getEditorRuntime(editor).edges(at);
};

const readRange = (
  editor: Editor,
  at: Location,
  to?: Location
): Range | undefined => {
  if (!hasLocationPath(editor, at) || (to && !hasLocationPath(editor, to))) {
    return undefined;
  }

  return getEditorRuntime(editor).range(at, to);
};

const readRangeFromEntries = (
  editor: Editor,
  entries: readonly NodeEntry[]
): Range | undefined => {
  const first = entries[0];
  const last = entries.at(-1);

  if (!first || !last) return undefined;

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

        const decoded = field.deserialize(existingState[field.key]);
        setDocumentState(editor, {
          ...existingState,
          [field.key]: cloneFrozen(decoded),
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
      ...existingState,
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

  const nextState = { ...existingState };

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
  const installed = getPluginRegistry(editor).effectTypes.get(type.key);

  if (!snapshot) {
    throw new Error('Effects can only be emitted during editor.update');
  }

  if (!installed) {
    throw new Error(
      `Editor effect "${type.key}" is not installed. Add it to an plugin's effects.`
    );
  }
  if (installed.type !== type) {
    throw new Error(
      `Editor effect "${type.key}" does not match the installed descriptor from "${installed.pluginName}".`
    );
  }

  const effect = createEditorEffect(type, value);

  if (!shouldEmitAuthoredEffect(editor, effect)) return;

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
    [...getPluginRegistry(editor).effectTypes.values()]
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
  options?: { at?: Location | NodeSelection }
): string | undefined => {
  if (options?.at !== undefined) {
    if (SelectionApi.isNode(options.at)) {
      return options.at.root ?? MAIN_ROOT_KEY;
    }

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
  if (getReadProjection(editor)) return getSnapshot(editor).index;
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

export const withUpdateTagContext = <T>(
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

export const stagePluginCandidate = (
  editor: Editor,
  key: string,
  input: PluginInput,
  onPublished?: (cleanup: () => void) => void,
  pluginEditor?: Editor,
  options: PluginReconfigureOptions = {}
) => {
  const owner = getEditorRuntimeOwner(editor);
  const snapshot = getTransactionSnapshot(owner);

  if (!snapshot) {
    throw new Error(
      'An editor plugin candidate can only be staged during editor.update.'
    );
  }

  snapshot.pluginReconfigurations.set(
    key,
    Object.freeze({
      editor: pluginEditor,
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

  if (snapshot.viewChanged) return true;

  if (snapshot.effects.length > 0 || snapshot.annotations.size > 0) {
    return true;
  }

  if (snapshot.pluginReconfigurations.size > 0) return true;

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
  const projection = getReadProjection(editor);
  if (projection) {
    const root = getCurrentChildrenRoot(editor);
    return (
      root === MAIN_ROOT_KEY
        ? projection.children
        : (projection.roots?.[root] ?? [])
    ) as V;
  }
  const context = getTransactionSpecContext(editor);

  if (context) {
    const { value } = context.snapshot.builder;
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
  const projection = getReadProjection(editor);
  if (projection) {
    return { [MAIN_ROOT_KEY]: projection.children, ...projection.roots };
  }
  const context = getTransactionSpecContext(editor);

  if (context) {
    const { value } = context.snapshot.builder;

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
    node = children[path[index]];

    if (!node) {
      return undefined;
    }

    if (index === path.length - 1) {
      return node;
    }

    if (!('children' in node) || !Array.isArray(node.children)) {
      return undefined;
    }

    ({ children } = node);
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

export const getNodeKey = <V extends Value>(
  editor: Editor<V>,
  path: Path
): NodeKey | null =>
  path.length === 0 ? null : getCurrentRuntimeIndex(editor).keyAt(path);

/**
 * Query runtime-backed element entries in one explicit root.
 *
 * @internal
 */
export const getEditorRuntimeElementEntries = (
  editor: Editor,
  types: readonly string[],
  root: RootKey
) =>
  withEditorRootChildren(editor, root, () =>
    getSnapshotIndexElementEntries(getCurrentRuntimeIndex(editor), types)
  );

/**
 * Read current root keys without traversing document content.
 *
 * @internal
 */
export const getEditorRuntimeRootKeys = (editor: Editor): readonly RootKey[] =>
  Object.freeze(Object.keys(getEditorDocumentRoots(editor)));

export const getEditorNodeKeyForNode = (
  editor: Editor,
  node: Descendant
): NodeKey => {
  const owner = getEditorRuntimeOwner(editor);
  let nodeKey = getNodeKeyForNode(node, owner);
  const index = getCurrentRuntimeIndex(owner);
  const resolvesIn = (candidate: SnapshotIndex) => {
    if (nodeKey && candidate.pathOf(nodeKey)) return true;

    candidate.entries();
    nodeKey = getNodeKeyForNode(node, owner);

    return Boolean(nodeKey && candidate.pathOf(nodeKey));
  };

  if (resolvesIn(index)) return getDefined(nodeKey);
  const currentRoot = getCurrentChildrenRoot(owner);
  const transactionSnapshot = getReadProjection(owner)
    ? undefined
    : getTransactionSnapshot(owner);

  for (const root of getEditorRuntimeRootKeys(owner)) {
    if (root === currentRoot) continue;
    const rootIndex = transactionSnapshot
      ? getTransactionSnapshotIndex(owner, transactionSnapshot, root)
      : getCurrentRootSnapshot(owner, root).index;

    if (resolvesIn(rootIndex)) return getDefined(nodeKey);
  }

  throw new Error(
    `Node key requires a live node in this editor; received ${
      'text' in node ? 'text' : `"${node.type}" element`
    }.`
  );
};

export const getPathByNodeKey = (
  editor: Editor,
  nodeKey: NodeKey
): Path | null => {
  const path = getCurrentRuntimeIndex(editor).pathOf(nodeKey);

  return path ? ([...path] as Path) : null;
};

export const getLastCommit = (editor: Editor): EditorCommit | null =>
  LAST_COMMIT.get(editor) ?? null;

const equalMarkValue = (left: unknown, right: unknown): boolean => {
  if (Object.is(left, right)) return true;
  if (Array.isArray(left) || Array.isArray(right)) {
    return (
      Array.isArray(left) &&
      Array.isArray(right) &&
      left.length === right.length &&
      left.every((value, index) => equalMarkValue(value, right[index]))
    );
  }
  if (
    typeof left !== 'object' ||
    left === null ||
    typeof right !== 'object' ||
    right === null
  ) {
    return false;
  }

  const leftRecord = left as Record<string, unknown>;
  const rightRecord = right as Record<string, unknown>;
  const keys = Object.keys(leftRecord);

  return (
    keys.length === Object.keys(rightRecord).length &&
    keys.every(
      (key) =>
        Object.hasOwn(rightRecord, key) &&
        equalMarkValue(leftRecord[key], rightRecord[key])
    )
  );
};

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

  if (SelectionApi.isNode(selection)) {
    return withEditorRootChildren(
      editor,
      selection.root ?? MAIN_ROOT_KEY,
      () => {
        const texts = selection.paths.flatMap((path) =>
          Array.from(
            getNodes(editor as unknown as Editor, {
              at: path,
              match: NodeApi.isText,
            })
          ).map(([node]) => node)
        );
        const first = texts[0];

        if (!first) return {};

        const common: Record<string, unknown> = { ...first };

        delete common.text;

        for (const text of texts.slice(1)) {
          for (const key of Object.keys(common)) {
            if (
              !Object.hasOwn(text, key) ||
              !equalMarkValue(common[key], text[key])
            ) {
              delete common[key];
            }
          }
        }

        // Dependent package configs preserve the generic mark projection even
        // when the root type-aware lint sees the assertion as redundant.
        // oxlint-disable-next-line typescript/no-unnecessary-type-assertion
        return common as EditorMarks<V>;
      }
    );
  }

  if (!RangeApi.isRange(selection)) {
    return null;
  }

  return withEditorRootChildren(editor, getCurrentSelectionRoot(editor), () => {
    let { anchor, focus } = selection;

    if (RangeApi.isExpanded(selection)) {
      if (RangeApi.isBackward(selection)) {
        [focus, anchor] = [anchor, focus];
      }

      const anchorEnd = readPointEdge(editor, anchor.path, 'end');

      if (anchorEnd && PointApi.equals(anchor, anchorEnd)) {
        const after = getEditorRuntime(editor).after(anchor);

        if (after) {
          anchor = after;
        }
      }

      const [match] = getNodes(editor as unknown as Editor, {
        at: { anchor, focus },
        match: NodeApi.isText,
      });

      if (match && NodeApi.isText(match[0])) {
        const [node] = match;
        const { text, ...rest } = node;

        // oxlint-disable-next-line typescript/no-unnecessary-type-assertion -- [P0 behavior-boundary] This restores the caller's generic text-mark shape after runtime NodeApi narrowing.
        return rest as EditorMarks<V>;
      }

      return {};
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
          getEditorSchema(editor).isMarkableVoid(n),
      });

      if (!markedVoid) {
        const block = getEditorRuntime(editor).above({
          match: (n: PliteNode) =>
            NodeApi.isElement(n) && !getEditorSchema(editor).isInline(n),
        });

        if (prev && NodeApi.isText(prev[0]) && block) {
          const [previousNode, prevPath] = prev;
          const [, blockPath] = block;

          if (PathApi.isAncestor(blockPath, prevPath)) {
            node = previousNode;
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

    // oxlint-disable-next-line typescript/no-unnecessary-type-assertion -- [P0 behavior-boundary] This restores the caller's generic text-mark shape after property filtering.
    return rest as EditorMarks<V>;
  });
};

const createNodesToArray = <V extends Value>(
  editor: Editor<V>
): EditorStateNodesApi<V>['toArray'] => {
  const toArray = (
    options: EditorNodesReadOptions<PliteNode> = {}
  ): readonly NodeEntry[] => {
    const resolvedOptions = resolveNodeTargetOrSpanOptions(editor, options);

    if (resolvedOptions === null) return [];

    return (({ options: innerOptions = {} }) =>
      withOptionsRootRead(
        editor,
        innerOptions as { at?: Location | NodeSelection | Span },
        () => {
          if (
            !hasReadableNodeCollection(
              editor,
              innerOptions as { at?: Location | NodeSelection | Span }
            )
          ) {
            return [];
          }

          const entries: NodeEntry[] = [];

          for (const entry of getNodes(
            editor as unknown as Editor,
            innerOptions
          )) {
            entries.push(entry);
          }

          return entries;
        },
        {
          selectionFallback: usesImplicitSelectionLocation(
            innerOptions as { at?: Location | NodeSelection | Span }
          ),
        }
      ))({
      options: resolvedOptions as EditorNodesOptions<PliteNode>,
    });
  };

  return toArray as EditorStateNodesApi<V>['toArray'];
};

type SelectionBlockState<V extends Value = Value> = Pick<
  EditorCoreStateView<V>,
  'nodes'
>;

type SelectionQueryState<V extends Value = Value> = Pick<
  EditorCoreStateView<V>,
  'nodes' | 'ranges'
>;

export const getSelectionNodeEntries = <V extends Value>(
  editor: Editor<V>,
  state: Pick<EditorCoreStateView<V>, 'nodes'>,
  selection: Selection
): ReadonlyArray<NodeEntry<DescendantIn<V>>> => {
  if (!SelectionApi.isNode(selection)) return [];

  const root = selection.root ?? MAIN_ROOT_KEY;
  const entries = withEditorRootChildren(editor, root, () =>
    selection.paths.flatMap((path) => {
      const entry = state.nodes.get(path, {
        match: (node): node is DescendantIn<V> => NodeApi.isDescendant(node),
      });

      return entry ? [entry] : [];
    })
  );

  return Object.freeze(entries);
};

const WHITESPACE_OR_END_REGEX = /^(?:\s|$)/;

const resolveSelectionQueryRange = (
  state: Pick<EditorStateView, 'ranges'>,
  selection: Range | null,
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
    endBlock: state.nodes.block({
      at: endPoint,
      match: options.match,
      type: options.type,
    }),
    startBlock: state.nodes.block({
      at: startPoint,
      match: options.match,
      type: options.type,
    }),
  };
};

export const isSelectionWithinBlock = <V extends Value>(
  state: SelectionQueryState<V>,
  selection: Range | null,
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
  selection: Range | null,
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

export const isSelectionAtBlockStart = <V extends Value>(
  state: SelectionQueryState<V> & Pick<EditorCoreStateView<V>, 'points'>,
  selection: Range | null,
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
  selection: Range | null,
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
    ? state.nodes.block({
        at: pointAfter,
        match: options.match,
        type: options.type,
      })
    : undefined;

  return !!nextBlock && !PathApi.equals(endBlock[1], nextBlock[1]);
};

export const doesSelectionIntersect = (
  state: Pick<EditorStateView, 'ranges'>,
  selection: Selection,
  target: NodeTarget,
  selectionRanges: readonly Range[] = RangeApi.isRange(selection)
    ? [selection]
    : []
) => {
  if (!selection) return false;

  const range = state.ranges.get(target);

  return (
    !!range &&
    selectionRanges.some(
      (selectionRange) => !!RangeApi.intersection(selectionRange, range)
    )
  );
};

export const doesSelectionContain = (
  state: Pick<EditorStateView, 'ranges'>,
  selection: Selection,
  target: NodeTarget,
  selectionRanges: readonly Range[] = RangeApi.isRange(selection)
    ? [selection]
    : []
) => {
  if (!selection) return false;

  const range = state.ranges.get(target);

  return (
    !!range &&
    selectionRanges.some((selectionRange) =>
      RangeApi.surrounds(selectionRange, range)
    )
  );
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

  const rewrite = (children: readonly Descendant[]) =>
    rewriteContentRootReferences(
      editor,
      children,
      (root) => remapped.get(root) ?? root
    );
  const roots = Object.freeze(
    Object.fromEntries(
      [...remapped].map(([source, target]) => [
        target,
        rewrite(getDefined(slice.roots)[source]),
      ])
    )
  );

  return ContentSlice.fromJSON<V>({
    content: rewrite(slice.content),
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
    const root = [...pending].sort()[0];

    pending.delete(root);
    if (created.has(root)) continue;
    const content = slice.roots[root];

    if (!content) continue;
    applyDocumentChangeStep(
      editor,
      getActiveDocumentChangeBuilder(editor).createRoot(root, content)
    );
    getTransactionSnapshot(editor)?.contentSliceRoots.add(root);
    created.add(root);

    collect(content);
  }
};

const fitSliceIntoActiveDraft = <V extends Value>(
  editor: Editor<V>,
  slice: import('../interfaces/editor').ContentSlice,
  options?: Parameters<EditorTransactionSliceApi<V>['replace']>[1],
  internal?: Readonly<{
    childrenAt?: NodeKey | Path;
    rootsPrepared?: boolean;
  }>
) => {
  const childrenRoot =
    internal?.childrenAt === undefined
      ? undefined
      : typeof internal.childrenAt === 'string'
        ? getRuntimeTargetRoot(editor, internal.childrenAt)
        : getCurrentChildrenRoot(editor);

  if (internal?.childrenAt !== undefined && !childrenRoot) return false;
  const runtimeRoot = childrenRoot ?? getNodeTargetRoot(editor, options?.at);
  const preResolvedOptions = runtimeRoot
    ? undefined
    : resolveNodeTargetOptions(editor, options);

  if (preResolvedOptions === null) return false;
  const root = runtimeRoot ?? getMutationRoot(editor, preResolvedOptions);

  return runWithMutationRoot(editor, root, () => {
    const resolvedOptions = runtimeRoot
      ? resolveNodeTargetOptions(editor, options)
      : preResolvedOptions;

    if (resolvedOptions === null) return false;
    let localOptions =
      resolvedOptions?.at === undefined
        ? resolvedOptions
        : {
            ...resolvedOptions,
            at: localizeLocation(resolvedOptions.at),
          };
    const state = getStateView(editor);
    const childrenAt =
      internal?.childrenAt === undefined
        ? undefined
        : typeof internal.childrenAt === 'string'
          ? getPathByNodeKey(editor, internal.childrenAt)
          : internal.childrenAt;

    if (internal?.childrenAt !== undefined) {
      if (!childrenAt || childrenAt.length === 0) return false;
      const parent = state.nodes.get(childrenAt)?.[0];

      if (!parent || !NodeApi.isElement(parent)) return false;
      const anchor = state.points.start(childrenAt);
      const focus = state.points.end(childrenAt);

      if (!anchor || !focus) return false;
      localOptions = {
        at: { anchor, focus },
        hanging: true,
      };
    }
    const sourceSlice = ContentSlice.fromJSON<V>(slice);
    const inputSlice = internal?.rootsPrepared
      ? sourceSlice
      : remapContentSliceRoots(editor, sourceSlice);
    const limitedSlice = limitSliceInsert(editor, inputSlice, localOptions);

    if (limitedSlice.content.length === 0 && inputSlice.content.length > 0) {
      return false;
    }

    let at = getTransactionView(editor).resolveTarget({ at: localOptions?.at });

    if (!at) at = getDefaultInsertLocation(editor);
    if (SelectionApi.isNode(at)) return false;

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
        const index = getDefined(at.at(-1));
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
              getChildren(editor)
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

    if (childrenAt && root !== MAIN_ROOT_KEY) {
      range = {
        anchor: { ...range.anchor, root },
        focus: { ...range.focus, root },
      };
    }
    const parentBounds = childrenAt
      ? DocumentIndex.fromValue(getChildren(editor)).nodeRange(childrenAt)
      : undefined;
    const fitBounds = parentBounds
      ? { from: parentBounds.from + 1, to: parentBounds.to - 1 }
      : insertionBoundary;

    const fit = () =>
      getEditorSchema(editor).fit(limitedSlice, {
        apply: (step, selection) => {
          applyDocumentChangeStep(
            editor,
            step,
            selection
              ? {
                  selectionAfter: selection,
                  selectionRoot: range.anchor.root ?? MAIN_ROOT_KEY,
                }
              : {}
          );
        },
        builder: getActiveDocumentChangeBuilder(editor),
        target: {
          at: range,
          ...(fitBounds
            ? {
                contentBounds: fitBounds,
                exactBounds: fitBounds,
              }
            : {}),
          kind: 'range',
        },
      });
    let fitted: boolean;

    if (internal?.rootsPrepared) return fit();

    if (limitedSlice.roots) {
      const rootSpec = createTransactionSpec(editor, () => {
        materializeContentSliceRoots(editor, limitedSlice);
      });
      let continuationFitted = false;
      const continuation = extendTransactionSpec(editor, rootSpec, () => {
        continuationFitted = fit();
      });

      fitted = continuationFitted;
      if (fitted) {
        try {
          const schema: InternalEditorSchemaApi = getEditorSchema(editor);

          schema.assertDocument(
            continuation.changes.apply(
              getActiveDocumentChangeBuilder(editor)
                .value as EditorDocumentValue
            )
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

export type InternalSliceChildrenTarget = NodeKey | Path;

export type InternalSlicePlacement<V extends Value = Value> = Readonly<{
  at: InternalSliceChildrenTarget;
  content: ReadonlyArray<DescendantIn<V>>;
}>;

/** Fit one complete slice into an element's exact child interval. */
export const fitSliceChildren = <V extends Value>(
  editor: Editor<V>,
  slice: import('../interfaces/editor').ContentSlice,
  options: Readonly<{ at: InternalSliceChildrenTarget }>
) =>
  fitSliceIntoActiveDraft(editor, slice, undefined, {
    childrenAt: options.at,
  });

type GroupedSliceParent = Readonly<{
  key: NodeKey;
  properties: Readonly<Record<string, unknown>>;
}>;

const fitSlicePlacementsIntoActiveDraft = <V extends Value>(
  editor: Editor<V>,
  sourceTile: import('../interfaces/editor').ContentSlice,
  placements: ReadonlyArray<InternalSlicePlacement<V>>
) => {
  const state = getStateView(editor);
  const schema: InternalEditorSchemaApi<V> = getEditorSchema(editor);
  const parents: GroupedSliceParent[] = [];
  const paths: Path[] = [];

  for (const placement of placements) {
    const path =
      typeof placement.at === 'string'
        ? getPathByNodeKey(editor, placement.at)
        : placement.at;

    if (!path || path.length === 0) return false;
    const node = state.nodes.get(path)?.[0];
    const key = getNodeKey(editor, path);

    if (!node || !NodeApi.isElement(node) || !key) return false;
    const { children: _children, ...properties } = node;

    parents.push({ key, properties });
    paths.push(path);
  }

  const orderedPaths = paths.toSorted(PathApi.compare);

  for (let index = 1; index < orderedPaths.length; index++) {
    const previous = getDefined(orderedPaths[index - 1]);
    const current = getDefined(orderedPaths[index]);

    if (
      PathApi.equals(previous, current) ||
      PathApi.isAncestor(previous, current)
    ) {
      return false;
    }
  }

  const root = getCurrentChildrenRoot(editor);
  const source = ContentSlice.fromJSON<V>(sourceTile);
  const usedRoots = new Set(
    Object.keys(
      (getActiveDocumentChangeBuilder(editor).value as EditorDocumentValue)
        .roots ?? {}
    )
  );
  const nextRootSuffix = new Map<string, number>();
  const ownership = new Map<string, 'exclusive' | 'shared'>();
  const sharedRoots = new Map<string, string>();
  const copiedRoots = new Map<string, readonly Descendant[]>();
  const prepareChildren = (
    children: readonly Descendant[],
    childrenRoot: string,
    exclusiveRoots: Map<string, string>
  ): readonly Descendant[] | null => {
    const copied = ContentSlice.closed(
      schema.copyChildren(children, childrenRoot)
    ).content;
    const collect = (nodes: readonly Descendant[]): boolean => {
      for (const node of nodes) {
        if (!NodeApi.isElement(node)) continue;

        for (const owned of schema.getElementOwnedRoots(node)) {
          const previousOwnership = ownership.get(owned.root);

          if (previousOwnership && previousOwnership !== owned.ownership) {
            return false;
          }
          ownership.set(owned.root, owned.ownership);
          const remapped =
            owned.ownership === 'shared' ? sharedRoots : exclusiveRoots;

          if (remapped.has(owned.root)) continue;
          const content =
            source.roots && Object.hasOwn(source.roots, owned.root)
              ? source.roots[owned.root]
              : undefined;

          if (!content) return false;
          let suffix = nextRootSuffix.get(owned.root) ?? 1;
          let name: string;

          do {
            name = `${owned.root}:copy${suffix === 1 ? '' : `:${suffix}`}`;
            suffix += 1;
          } while (usedRoots.has(name));
          nextRootSuffix.set(owned.root, suffix);
          usedRoots.add(name);
          remapped.set(owned.root, name);

          const prepared = prepareChildren(content, owned.root, exclusiveRoots);

          if (!prepared) return false;
          copiedRoots.set(name, prepared);
        }
        if (!collect(node.children)) return false;
      }

      return true;
    };

    if (!collect(copied)) return null;

    return rewriteContentRootReferences(editor, copied, (name) =>
      getDefined(sharedRoots.get(name) ?? exclusiveRoots.get(name))
    );
  };
  const copied: Array<readonly Descendant[]> = [];

  for (const placement of placements) {
    const content = prepareChildren(placement.content, root, new Map());

    if (!content) return false;
    copied.push(content);
  }
  const prepared = ContentSlice.fromJSON<V>({
    content: copied.flat(),
    openEnd: 0,
    openStart: 0,
    ...(copiedRoots.size > 0 ? { roots: Object.fromEntries(copiedRoots) } : {}),
  });

  materializeContentSliceRoots(editor, prepared);

  const verifyParent = (parent: GroupedSliceParent) => {
    const path = getPathByNodeKey(editor, parent.key);
    const node = path ? getStateView(editor).nodes.get(path)?.[0] : undefined;

    if (!path || !node || !NodeApi.isElement(node)) return null;
    const { children: _children, ...properties } = node;

    return areEditorJsonValuesEqual(parent.properties, properties)
      ? { node, path }
      : null;
  };
  let offset = 0;

  for (let index = 0; index < parents.length; index++) {
    const parent = verifyParent(getDefined(parents[index]));
    const childCount = getDefined(copied[index]).length;
    const content = prepared.content.slice(offset, offset + childCount);

    offset += childCount;
    if (!parent) return false;
    if (
      !fitSliceIntoActiveDraft(
        editor,
        ContentSlice.fromJSON({
          content,
          openEnd: 0,
          openStart: 0,
          ...(prepared.roots ? { roots: prepared.roots } : {}),
        }),
        undefined,
        {
          childrenAt: getDefined(parents[index]).key,
          rootsPrepared: true,
        }
      ) ||
      !verifyParent(getDefined(parents[index]))
    ) {
      return false;
    }
  }

  const surviving = new Set<string>();
  const current = getActiveDocumentChangeBuilder(editor)
    .value as EditorDocumentValue;
  const walk = (children: readonly Descendant[]): boolean => {
    for (const node of children) {
      if (!NodeApi.isElement(node)) continue;

      for (const { root: ownedRoot } of schema.getElementOwnedRoots(node)) {
        if (surviving.has(ownedRoot)) continue;
        const rootChildren = current.roots?.[ownedRoot];

        if (!prepared.roots?.[ownedRoot] || !rootChildren) return false;
        surviving.add(ownedRoot);
        if (!walk(rootChildren)) return false;
      }
      if (!walk(node.children)) return false;
    }

    return true;
  };

  for (const parent of parents) {
    const target = verifyParent(parent);

    if (!target || !walk(target.node.children)) return false;
  }
  for (const rootName of Object.keys(prepared.roots ?? {})) {
    if (surviving.has(rootName) || !current.roots?.[rootName]) continue;
    applyDocumentChangeStep(
      editor,
      getActiveDocumentChangeBuilder(editor).deleteRoot(rootName)
    );
    getTransactionSnapshot(editor)?.contentSliceRoots.delete(rootName);
  }

  finalizeTransactionRepresentation(editor);
  if (parents.some((parent) => !verifyParent(parent))) return false;
  schema.assertDocument(getActiveDocumentChangeBuilder(editor).value);

  return true;
};

/** Fit one complete source tile into multiple exact child intervals atomically. */
export const fitSlicePlacements = <V extends Value>(
  editor: Editor<V>,
  sourceTile: import('../interfaces/editor').ContentSlice,
  options: Readonly<{
    placements: ReadonlyArray<InternalSlicePlacement<V>>;
  }>
) => {
  if (options.placements.length === 0) return false;
  const roots = new Set(
    options.placements.map((placement) =>
      typeof placement.at === 'string'
        ? getRuntimeTargetRoot(editor, placement.at)
        : getCurrentChildrenRoot(editor)
    )
  );

  if (roots.size !== 1 || roots.has(undefined)) return false;
  let fitted = false;

  try {
    const spec = createTransactionSpec(editor, () => {
      fitted = runWithMutationRoot(editor, getDefined([...roots][0]), () =>
        fitSlicePlacementsIntoActiveDraft(
          editor,
          sourceTile,
          options.placements
        )
      );
    });

    if (!fitted) return false;
    applyTransactionSpec(editor, spec);

    return true;
  } catch (error) {
    if (error instanceof EditorSchemaValidationError) return false;
    throw error;
  }
};

const createSliceFitTransactionSpec = <V extends Value>(
  editor: Editor<V>,
  slice: import('../interfaces/editor').ContentSlice,
  options?: Parameters<EditorTransactionSliceApi<V>['replace']>[1]
): false | TransactionSpec => {
  let applicable = false;
  const spec = createTransactionSpec(editor, () => {
    applicable = fitSliceIntoActiveDraft(editor, slice, options);
  });

  return applicable ? spec : false;
};

const isReadMethodRecord = (value: object) => {
  const prototype = Object.getPrototypeOf(value);

  if (prototype === null) return true;
  const objectConstructor = Object.getOwnPropertyDescriptor(
    prototype,
    'constructor'
  )?.value;

  return (
    Object.getPrototypeOf(prototype) === null &&
    typeof objectConstructor === 'function' &&
    objectConstructor.name === 'Object'
  );
};

const READ_METHOD_FUNCTION_INTRINSIC_KEYS = new Set([
  'arguments',
  'caller',
  'length',
  'name',
  'prototype',
]);

const isValidFunctionIntrinsicDescriptor = (
  key: string,
  descriptor: PropertyDescriptor
) => {
  if (!('value' in descriptor) || descriptor.enumerable) return false;

  switch (key) {
    case 'length': {
      return (
        typeof descriptor.value === 'number' && descriptor.writable === false
      );
    }
    case 'name': {
      return (
        typeof descriptor.value === 'string' && descriptor.writable === false
      );
    }
    case 'arguments':
    case 'caller': {
      return (
        descriptor.value === null &&
        descriptor.writable === false &&
        descriptor.configurable === false
      );
    }
    case 'prototype': {
      return (
        typeof descriptor.value === 'object' &&
        descriptor.value !== null &&
        descriptor.configurable === false
      );
    }
    default: {
      return false;
    }
  }
};

const freezeReadMethodTree = (
  groupName: string,
  value: unknown,
  path: readonly string[] = [],
  visited = new WeakSet<object>()
): unknown => {
  if (typeof value !== 'function' && (typeof value !== 'object' || !value)) {
    throw new TypeError(
      `Editor read group "${groupName}" must return a callable method tree; "${[
        groupName,
        ...path,
      ].join('.')}" is a data value.`
    );
  }
  if (Array.isArray(value)) {
    throw new TypeError(
      `Editor read group "${groupName}" must return a callable method tree; arrays are not supported.`
    );
  }
  if (visited.has(value)) {
    throw new TypeError(
      `Editor read group "${groupName}" must return a callable method tree; cycles are not supported.`
    );
  }
  if (typeof value !== 'function' && !isReadMethodRecord(value)) {
    throw new TypeError(
      `Editor read group "${groupName}" must return a callable method tree; only plain records and methods are supported.`
    );
  }

  visited.add(value);

  for (const key of Reflect.ownKeys(value)) {
    const descriptor = getDefined(Object.getOwnPropertyDescriptor(value, key));

    if (
      typeof value === 'function' &&
      typeof key === 'string' &&
      READ_METHOD_FUNCTION_INTRINSIC_KEYS.has(key)
    ) {
      if (!isValidFunctionIntrinsicDescriptor(key, descriptor)) {
        throw new TypeError(
          `Editor read group "${groupName}" must return a callable method tree; function intrinsic property "${key}" was redefined.`
        );
      }
      continue;
    }
    if (typeof key === 'symbol') {
      throw new TypeError(
        `Editor read group "${groupName}" must return a callable method tree; symbol properties are not supported.`
      );
    }
    if (key === 'then' || key === 'toJSON') {
      throw new TypeError(
        `Editor read group "${groupName}" method "${[...path, key].join(
          '.'
        )}" uses a reserved protocol name.`
      );
    }
    if ('get' in descriptor || 'set' in descriptor) {
      throw new TypeError(
        `Editor read group "${groupName}" must return a callable method tree; accessors are not supported.`
      );
    }
    if (!descriptor.enumerable) {
      throw new TypeError(
        `Editor read group "${groupName}" must return a callable method tree; non-enumerable properties are not supported.`
      );
    }
    freezeReadMethodTree(groupName, descriptor.value, [...path, key], visited);
  }

  visited.delete(value);

  return Object.freeze(value);
};

const assertUpdateMethodTreeProtocolKeys = (
  groupName: string,
  value: unknown,
  path: readonly string[] = [],
  visited = new WeakSet<object>()
) => {
  if (
    (typeof value !== 'object' || value === null) &&
    typeof value !== 'function'
  ) {
    return;
  }
  if (visited.has(value)) return;

  visited.add(value);

  for (const key of Reflect.ownKeys(value)) {
    if (typeof key !== 'string') continue;
    if (key === 'then' || key === 'toJSON') {
      throw new TypeError(
        `Editor update group "${groupName}" method "${[...path, key].join(
          '.'
        )}" uses a reserved protocol name.`
      );
    }
    const descriptor = Object.getOwnPropertyDescriptor(value, key);

    if (descriptor && 'value' in descriptor) {
      assertUpdateMethodTreeProtocolKeys(
        groupName,
        descriptor.value,
        [...path, key],
        visited
      );
    }
  }
};

const createReadFactoryState = <T extends Record<string, unknown>>(
  state: T
) => {
  let constructing = true;
  const cache = new WeakMap<object, object>();
  const guard = (value: unknown): unknown => {
    if (
      (typeof value !== 'object' || value === null) &&
      typeof value !== 'function'
    ) {
      return value;
    }

    const existing = cache.get(value);
    if (existing) return existing;

    const target =
      typeof value === 'function'
        ? () => {}
        : Object.create(Reflect.getPrototypeOf(value));
    const synchronizedKeys = new Set<PropertyKey>();
    const synchronizeOwnProperty = (key: PropertyKey) => {
      if (synchronizedKeys.has(key)) return;

      const descriptor = Reflect.getOwnPropertyDescriptor(value, key);

      if (!descriptor) {
        synchronizedKeys.add(key);
        return;
      }
      const targetDescriptor = Reflect.getOwnPropertyDescriptor(target, key);

      if (targetDescriptor && !targetDescriptor.configurable) {
        synchronizedKeys.add(key);
        return;
      }

      Object.defineProperty(
        target,
        key,
        'value' in descriptor
          ? {
              configurable: true,
              enumerable: descriptor.enumerable,
              value: guard(descriptor.value),
              writable: descriptor.writable,
            }
          : {
              configurable: true,
              enumerable: descriptor.enumerable,
              get: descriptor.get
                ? (guard(descriptor.get) as () => unknown)
                : undefined,
              set: descriptor.set
                ? (guard(descriptor.set) as (value: unknown) => void)
                : undefined,
            }
      );
      synchronizedKeys.add(key);
    };
    const synchronizeOwnProperties = () => {
      for (const key of Reflect.ownKeys(value)) synchronizeOwnProperty(key);
    };
    const proxy = new Proxy(target, {
      apply(_target, thisArg, args) {
        if (constructing) {
          throw new Error(
            'Editor read factories cannot read document state while constructing read groups. Return methods that read state when invoked.'
          );
        }

        return Reflect.apply(
          value as (...args: unknown[]) => unknown,
          thisArg,
          args
        );
      },
      get(_target, key) {
        return guard(Reflect.get(value, key, value));
      },
      getOwnPropertyDescriptor(_target, key) {
        synchronizeOwnProperty(key);
        return Reflect.getOwnPropertyDescriptor(target, key);
      },
      has(_target, key) {
        return Reflect.has(value, key);
      },
      ownKeys() {
        synchronizeOwnProperties();
        return Reflect.ownKeys(target);
      },
      preventExtensions() {
        synchronizeOwnProperties();
        return Reflect.preventExtensions(target);
      },
    });

    cache.set(value, proxy);

    return proxy;
  };

  return {
    finish: () => {
      constructing = false;
    },
    state: guard(state) as T,
  };
};

const getStateView = <
  V extends Value,
  TPlugins extends readonly unknown[] = readonly [],
>(
  editor: Editor<V, TPlugins>
): EditorStateView<V, TPlugins> => {
  const registry = getPluginRegistry(editor);
  const owner = getEditorRuntimeOwner(editor);
  const transformGeneration = STATE_VIEW_TRANSFORM_GENERATIONS.get(owner) ?? 0;
  const cached = STATE_VIEW_CACHE.get(editor);

  if (
    cached?.registry === registry &&
    cached.transformGeneration === transformGeneration
  ) {
    return cached.view as unknown as EditorStateView<V, TPlugins>;
  }
  if (CONSTRUCTING_STATE_VIEWS.has(editor)) {
    throw new Error(
      'editor.read cannot be called while constructing read groups'
    );
  }

  CONSTRUCTING_STATE_VIEWS.add(editor);

  try {
    let state!: EditorStateView<V, TPlugins>;
    const fragmentApi = Object.freeze(((options = {}) =>
      (({ options: innerOptions2 }) => {
        const readOptions = innerOptions2 ?? {};

        return withOptionsRootRead(
          editor,
          readOptions,
          () => {
            if (readOptions.at && !hasLocationPath(editor, readOptions.at)) {
              return [];
            }

            return getFragment(editor, readOptions) as Array<DescendantIn<V>>;
          },
          { selectionFallback: usesImplicitSelectionLocation(readOptions) }
        );
      })({ options })) satisfies EditorStateFragmentApi<V>);
    const marksApi = Object.freeze((() =>
      getSelectionMarks(editor)) satisfies EditorStateMarksApi<V>);
    const getSlice: EditorStateSliceApi<V>['get'] = (options = {}) => {
      const selection = getCurrentSelection(editor);
      const target = options.at ?? selection;
      const read = () => {
        if (
          target &&
          RangeApi.isRange(target) &&
          !hasLocationPath(editor, target)
        ) {
          return ContentSlice.empty;
        }

        return getContentSlice(
          editor,
          SelectionApi.isNode(target) || RangeApi.isRange(target)
            ? target
            : null
        );
      };

      const slice = SelectionApi.isNode(target)
        ? withEditorRootChildren(editor, target.root ?? MAIN_ROOT_KEY, read)
        : withOptionsRootRead(editor, options as { at?: Range }, read, {
            selectionFallback: options.at === undefined,
          });

      return projectEditorGetSlice(editor, slice, options);
    };
    const sliceApi = Object.freeze({
      export: (options = {}) =>
        projectEditorExportSlice(editor, getSlice(options), options),
      fit: (
        slice: import('../interfaces/editor').ContentSlice,
        options?: Parameters<EditorStateSliceApi<V>['fit']>[1]
      ) => createSliceFitTransactionSpec(editor, slice, options),
      fitContent: (
        slice: import('../interfaces/editor').ContentSlice,
        options: Parameters<EditorStateSliceApi<V>['fitContent']>[1]
      ) => {
        if (options.root === MAIN_ROOT_KEY) {
          throw new Error(
            '[Plite] Omit root to use the primary document context.'
          );
        }

        const scopedRoot = getCurrentChildrenRoot(editor);
        const root =
          options.root ??
          (scopedRoot === MAIN_ROOT_KEY ? undefined : scopedRoot);

        return getEditorSchema(editor).fitContent(
          ContentSlice.fromJSON<V>(slice),
          {
            parent: options.parent,
            ...(root === undefined ? {} : { root }),
          }
        ) as ReadonlyArray<DescendantIn<V>> | null;
      },
      get: getSlice,
    }) satisfies EditorStateSliceApi<V>;
    const selectionNodes = () =>
      getSelectionNodeEntries(editor, state, getCurrentSelection(editor));
    const selectionApi = Object.freeze(
      Object.assign(() => getPublicSelection(editor), {
        contains: (target: NodeTarget) => {
          const selection = getCurrentSelection(editor);

          return doesSelectionContain(
            state,
            selection,
            target,
            getSelectionRanges(
              editor,
              selection,
              getEditorDocumentValue(editor)
            )
          );
        },
        intersects: (target: NodeTarget) => {
          const selection = getCurrentSelection(editor);

          return doesSelectionIntersect(
            state,
            selection,
            target,
            getSelectionRanges(
              editor,
              selection,
              getEditorDocumentValue(editor)
            )
          );
        },
        isAcrossBlocks: (options?: EditorSelectionBlockOptions) =>
          isSelectionAcrossBlocks(state, getPublicSelection(editor), options),
        isAtBlockEnd: (options?: EditorSelectionBlockOptions) =>
          isSelectionAtBlockEnd(state, getPublicSelection(editor), options),
        isAtBlockStart: (options?: EditorSelectionBlockOptions) =>
          isSelectionAtBlockStart(state, getPublicSelection(editor), options),
        isCollapsed: () => {
          const selection = getPublicSelection(editor);

          return selection ? RangeApi.isCollapsed(selection) : false;
        },
        isExpanded: () => {
          const selection = getPublicSelection(editor);

          return selection ? RangeApi.isExpanded(selection) : false;
        },
        isValid: (value: unknown) =>
          isValidEditorSelection(
            editor,
            value,
            getEditorDocumentValue(editor),
            getCurrentChildrenRoot(editor)
          ),
        isWithinBlock: (options?: EditorSelectionBlockOptions) =>
          isSelectionWithinBlock(state, getPublicSelection(editor), options),
        nodes: selectionNodes,
        ranges: () =>
          getSelectionRanges(
            editor,
            getCurrentSelection(editor),
            getEditorDocumentValue(editor)
          ),
      }) satisfies EditorStateSelectionApi<SelectionValue, V>
    );
    const readBlock = ((
      options: {
        at?: NodeTarget;
        match?: NodeMatch<Element>;
        mode?: MaximizeMode;
        type?: NodeTypeSelector;
        voids?: boolean;
      } = {}
    ) =>
      withNodeTargetRootRead(editor, options.at, () => {
        const resolvedOptions = resolveNodeTargetOptions(editor, options);

        if (resolvedOptions === null) return undefined;
        const nextOptions = resolvedOptions ?? {};
        const { match } = nextOptions;
        const exact = PathApi.isPath(nextOptions.at)
          ? readNodeEntry<PliteNode>(editor, nextOptions.at)
          : undefined;

        if (
          exact &&
          NodeApi.isElement(exact[0]) &&
          getEditorSchema(editor).isBlock(exact[0]) &&
          (match?.(exact[0], exact[1]) ?? true)
        ) {
          return exact as NodeEntry<any>;
        }
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
      })) as EditorStateNodesApi<V>['block'];
    const readBlocks = ((
      inputOptions: Parameters<EditorStateNodesApi<V>['blocks']>[0] = {}
    ) => {
      const target =
        inputOptions.at ?? getCurrentSelection(editor) ?? undefined;

      if (!target) return [];

      const match = normalizeNodeMatch(inputOptions.type, inputOptions.match);
      const matchesBlock = (node: PliteNode, path: Path) =>
        NodeApi.isElement(node) &&
        getEditorSchema(editor).isBlock(node) &&
        (match?.(node, path) ?? true);

      if (SelectionApi.isNode(target)) {
        return withEditorRootChildren(
          editor,
          target.root ?? MAIN_ROOT_KEY,
          () => {
            const entries: Array<NodeEntry<Element>> = [];
            const {
              at: _at,
              reverse: _reverse,
              ...queryOptions
            } = inputOptions;

            for (const path of target.paths) {
              const selectedBlocks = Array.from(
                getNodes(editor as unknown as Editor, {
                  ...queryOptions,
                  at: path,
                  match: matchesBlock,
                  mode: queryOptions.mode ?? 'lowest',
                })
              ) as Array<NodeEntry<Element>>;
              const fallbackBlock =
                selectedBlocks.length === 0
                  ? readBlock({ at: path, match: matchesBlock })
                  : undefined;
              const blocks =
                selectedBlocks.length > 0
                  ? selectedBlocks
                  : fallbackBlock
                    ? [fallbackBlock as NodeEntry<Element>]
                    : [];

              for (const block of blocks) {
                if (
                  !entries.some(([, candidate]) =>
                    PathApi.equals(candidate, block[1])
                  )
                ) {
                  entries.push(block);
                }
              }
            }

            return Object.freeze(
              inputOptions.reverse ? entries.toReversed() : entries
            );
          }
        );
      }

      const resolvedOptions = resolveNodeTargetOrSpanOptions(editor, {
        ...inputOptions,
        at: target,
      });

      if (resolvedOptions === null) return [];
      const queryOptions = resolvedOptions ?? {};

      return withOptionsRootRead(editor, queryOptions, () =>
        Object.freeze(
          Array.from(
            getNodes(editor as unknown as Editor, {
              ...queryOptions,
              match: matchesBlock,
              mode: queryOptions.mode ?? 'lowest',
            })
          ) as Array<NodeEntry<Element>>
        )
      );
    }) as EditorStateNodesApi<V>['blocks'];
    function getStateNodeKey(node: Descendant): NodeKey;
    function getStateNodeKey(at: Location): NodeKey | null;
    function getStateNodeKey(target: Descendant | Location): NodeKey | null {
      if (NodeApi.isDescendant(target)) {
        return getEditorNodeKeyForNode(editor, target);
      }

      return withLocationRootRead(editor, target, () => {
        const path = readNodePath(editor, target);

        return path ? getNodeKey(editor, path) : null;
      });
    }

    const coreState = {
      children: () =>
        (getEditorDocumentRoots(editor)[MAIN_ROOT_KEY] ??
          []) as unknown as readonly [...V],
      fragment: fragmentApi,
      getField: <TValue>(field: EditorStateField<TValue>) =>
        getStateFieldValue(editor, field),
      key: getStateNodeKey,
      lastCommit: () => getLastCommit(editor) as EditorCommit<V> | null,
      marks: marksApi,
      meta: () => getEditorDocumentValue(editor).meta,
      nodes: Object.freeze<EditorStateNodesApi<V>>({
        above: ((options = {}) =>
          withNodeTargetRootRead(editor, getOptionsNodeTarget(options), () => {
            const resolvedOptions = resolveNodeTargetOptions(editor, options);

            if (resolvedOptions === null) return undefined;

            return (({ options: innerOptions3 }) =>
              getEditorRuntime(editor).above(innerOptions3))({
              options: resolvedOptions,
            }) as [Ancestor, Path] | undefined;
          })) as EditorStateNodesApi<V>['above'],
        block: readBlock,
        blocks: readBlocks,
        children(
          target: NodeTarget = []
        ): ReturnType<EditorStateNodesApi<V>['children']> {
          return withNodeTargetRootRead(editor, target, () => {
            const at = resolveReadableNodeTarget(editor, target);

            if (!at) return [];

            return (({ at: innerAt = [] }) =>
              withLocationRootRead(editor, innerAt, () =>
                readNodeChildren(editor, innerAt)
              ))({ at }) as ReturnType<EditorStateNodesApi<V>['children']>;
          });
        },
        elementReadOnly: (options = {}) =>
          withNodeTargetRootRead(editor, options.at, () => {
            const resolvedOptions = resolveNodeTargetOptions(editor, options);

            if (resolvedOptions === null) return undefined;

            return (({ options: innerOptions4 }) =>
              getEditorRuntime(editor).elementReadOnly(innerOptions4))({
              options: resolvedOptions,
            });
          }),
        first: (target: NodeTarget) =>
          withNodeTargetRootRead(editor, target, () => {
            const at = resolveReadableNodeTarget(editor, target);

            if (!at) return undefined;

            return (({ at: innerAt2 }) =>
              withLocationRootRead(editor, innerAt2, () =>
                readNodeFirst(editor, innerAt2)
              ))({
              at,
            });
          }),
        get: ((
          target: NodeTarget,
          options: EditorNodeGetOptions<PliteNode> = {}
        ) =>
          withNodeTargetRootRead(editor, target, () => {
            const at = resolveReadableNodeTarget(editor, target);

            if (!at) return undefined;

            return (({ at: innerAt3, options: innerOptions5 }) =>
              withLocationRootRead(editor, innerAt3, () => {
                const entry = readNodeEntry<PliteNode>(editor, innerAt3);
                const match = normalizeNodeMatch(
                  innerOptions5.type,
                  innerOptions5.match
                );

                if (!entry) return undefined;

                return !match || match(entry[0], entry[1]) ? entry : undefined;
              }))({ at, options });
          })) as EditorStateNodesApi<V>['get'],
        isSelectable: (element: import('../interfaces/node').Node) =>
          isEditorNodeSelectable(editor, element),
        isEmpty: (element: import('../interfaces/element').Element) =>
          (({ element: innerElement5 }) =>
            getEditorRuntime(editor).isEmpty(innerElement5))({
            element,
          }),
        last: (target: NodeTarget, options = {}) =>
          withNodeTargetRootRead(editor, target, () => {
            const at = resolveReadableNodeTarget(editor, target);

            if (!at) return undefined;

            return (({ at: innerAt4, options: innerOptions6 }) =>
              getEditorRuntime(editor).last(innerAt4, innerOptions6))({
              at,
              options,
            });
          }),
        leaf: (target: NodeTarget, options: EditorLeafOptions = {}) =>
          withNodeTargetRootRead(editor, target, () => {
            const at = resolveReadableNodeTarget(editor, target);

            if (!at) return undefined;

            return (({ at: innerAt5, options: innerOptions7 }) =>
              withLocationRootRead(editor, innerAt5, () =>
                readNodeLeaf(editor, innerAt5, innerOptions7)
              ))({ at, options }) as ReturnType<EditorStateNodesApi<V>['leaf']>;
          }),
        levels: <T extends PliteNode>(options = {}) =>
          withNodeTargetRootGenerator(
            editor,
            getOptionsNodeTarget(options),
            () => {
              const resolvedOptions = resolveNodeTargetOptions(editor, options);

              if (resolvedOptions === null) return [];

              return hasReadableNodeCollection(editor, resolvedOptions)
                ? getEditorRuntime(editor).levels(resolvedOptions)
                : [];
            }
          ) as Generator<[T, Path], void, undefined>,
        path: (target: NodeTarget, options: EditorPathOptions = {}) => {
          // A Path has no root discriminator. Keep this lookup scoped to the
          // current editor/view root; use a root view for a named-root path.
          const at = resolveReadableNodeTarget(editor, target);

          if (!at) return undefined;

          return (({ at: innerAt6, options: innerOptions8 }) =>
            withLocationRootRead(editor, innerAt6, () =>
              readNodePath(editor, innerAt6, innerOptions8)
            ))({ at, options });
        },
        entries: <T extends PliteNode>(options = {}) =>
          withNodeTargetRootGenerator(
            editor,
            getOptionsNodeTarget(options),
            () => {
              const resolvedOptions = resolveNodeTargetOrSpanOptions(
                editor,
                options
              );

              if (resolvedOptions === null) return [];

              return withOptionsRootGenerator(
                editor,
                resolvedOptions,
                () =>
                  hasReadableNodeCollection(editor, resolvedOptions)
                    ? getNodes(editor as unknown as Editor, resolvedOptions)
                    : [],
                {
                  selectionFallback:
                    usesImplicitSelectionLocation(resolvedOptions),
                }
              );
            }
          ) as Generator<[T, Path], void, undefined>,
        find: ((options = {}) =>
          withNodeTargetRootRead(editor, getOptionsNodeTarget(options), () => {
            const resolvedOptions = resolveNodeTargetOrSpanOptions(
              editor,
              options
            );

            if (resolvedOptions === null) {
              return undefined;
            }

            return withOptionsRootRead(
              editor,
              resolvedOptions,
              () => {
                if (!hasReadableNodeCollection(editor, resolvedOptions)) {
                  return undefined;
                }
                const [entry] = getNodes(
                  editor as unknown as Editor,
                  resolvedOptions
                );

                return entry;
              },
              {
                selectionFallback:
                  usesImplicitSelectionLocation(resolvedOptions),
              }
            );
          }) as
            | [PliteNode, Path]
            | undefined) as EditorStateNodesApi<V>['find'],
        some: (options = {}) =>
          withNodeTargetRootRead(editor, getOptionsNodeTarget(options), () => {
            const resolvedOptions = resolveNodeTargetOrSpanOptions(
              editor,
              options
            );

            if (resolvedOptions === null) {
              return false;
            }

            return withOptionsRootRead(
              editor,
              resolvedOptions,
              () => {
                if (!hasReadableNodeCollection(editor, resolvedOptions)) {
                  return false;
                }
                const [entry] = getNodes(
                  editor as unknown as Editor,
                  resolvedOptions
                );

                return entry !== undefined;
              },
              {
                selectionFallback:
                  usesImplicitSelectionLocation(resolvedOptions),
              }
            );
          }),
        toArray: createNodesToArray(editor),
        next: ((options = {}) =>
          withNodeTargetRootRead(editor, getOptionsNodeTarget(options), () => {
            const resolvedOptions = resolveNodeTargetOptions(editor, options);

            if (resolvedOptions === null) return undefined;

            return (
              hasReadableNodeCollection(editor, resolvedOptions)
                ? getEditorRuntime(editor).next(resolvedOptions)
                : undefined
            ) as [PliteNode, Path] | undefined;
          })) as EditorStateNodesApi<V>['next'],
        previous: ((options = {}) =>
          withNodeTargetRootRead(editor, getOptionsNodeTarget(options), () => {
            const resolvedOptions = resolveNodeTargetOptions(editor, options);

            if (resolvedOptions === null) return undefined;

            return (
              hasReadableNodeCollection(editor, resolvedOptions)
                ? getEditorRuntime(editor).previous(resolvedOptions)
                : undefined
            ) as [PliteNode, Path] | undefined;
          })) as EditorStateNodesApi<V>['previous'],
        parent: ((target: NodeTarget, options: EditorParentOptions = {}) =>
          withNodeTargetRootRead(editor, target, () => {
            const at = resolveReadableNodeTarget(editor, target);

            if (!at) return undefined;

            return (({ at: innerAt7, options: innerOptions9 }) =>
              withLocationRootRead(editor, innerAt7, () => {
                const entry = readNodeParent(editor, innerAt7, innerOptions9);
                const match = normalizeNodeMatch(
                  innerOptions9.type,
                  innerOptions9.match
                );

                if (!entry) return undefined;

                return !match || match(entry[0], entry[1]) ? entry : undefined;
              }))({ at, options });
          })) as EditorStateNodesApi<V>['parent'],
        void: (options = {}) =>
          withNodeTargetRootRead(editor, options.at, () => {
            const resolvedOptions = resolveNodeTargetOptions(editor, options);

            if (resolvedOptions === null) return undefined;

            return getEditorRuntime(editor).void(resolvedOptions);
          }),
      }),
      points: Object.freeze({
        after: (target: NodeTarget, options = {}) =>
          withNodeTargetRootRead(editor, target, () => {
            const at = resolveReadableNodeTarget(editor, target);

            if (!at) return undefined;

            return readAdjacentPoint(editor, at, 'after', options);
          }),
        before: (target: NodeTarget, options = {}) =>
          withNodeTargetRootRead(editor, target, () => {
            const at = resolveReadableNodeTarget(editor, target);

            if (!at) return undefined;

            return readAdjacentPoint(editor, at, 'before', options);
          }),
        end: (target: NodeTarget) =>
          withNodeTargetRootRead(editor, target, () => {
            const at = resolveReadableNodeTarget(editor, target);

            return at ? readPointEdge(editor, at, 'end') : undefined;
          }),
        get: (target: NodeTarget, options: EditorPointOptions = {}) =>
          withNodeTargetRootRead(editor, target, () => {
            const at = resolveReadableNodeTarget(editor, target);

            return at ? readPoint(editor, at, options) : undefined;
          }),
        isEdge: (point, target) =>
          withNodeTargetRootRead(editor, target, () => {
            const at = resolveReadableNodeTarget(editor, target);

            return (
              !!at &&
              hasLocationPath(editor, at) &&
              getEditorRuntime(editor).isEdge(point, at)
            );
          }),
        isEnd: (point, target) =>
          withNodeTargetRootRead(editor, target, () => {
            const at = resolveReadableNodeTarget(editor, target);

            return (
              !!at &&
              hasLocationPath(editor, at) &&
              getEditorRuntime(editor).isEnd(point, at)
            );
          }),
        isStart: (point, target) =>
          withNodeTargetRootRead(editor, target, () => {
            const at = resolveReadableNodeTarget(editor, target);

            return (
              !!at &&
              hasLocationPath(editor, at) &&
              getEditorRuntime(editor).isStart(point, at)
            );
          }),
        isWordEnd: (point) => {
          const after = state.points.after(point);

          if (!after) return true;

          const range = state.ranges.get(point, after);

          return (
            !!range && WHITESPACE_OR_END_REGEX.test(state.text.string(range))
          );
        },
        positions: (options = {}) =>
          withNodeTargetRootGenerator(editor, options.at, () => {
            const resolvedOptions = resolveNodeTargetOptions(editor, options);

            return resolvedOptions !== null &&
              hasReadableNodeCollection(editor, resolvedOptions)
              ? getEditorRuntime(editor).positions(resolvedOptions)
              : [];
          }),
        start: (target: NodeTarget) =>
          withNodeTargetRootRead(editor, target, () => {
            const at = resolveReadableNodeTarget(editor, target);

            return at ? readPointEdge(editor, at, 'start') : undefined;
          }),
      }),
      ranges: Object.freeze({
        edges: (target: NodeTarget) =>
          withNodeTargetRootRead(editor, target, () => {
            const at = resolveReadableNodeTarget(editor, target);

            return at ? readRangeEdges(editor, at) : undefined;
          }),
        fromEntries: (entries) =>
          (({ entries: innerEntries }) =>
            readRangeFromEntries(editor, innerEntries))({ entries }),
        get: (target: NodeTarget, to?: Location) =>
          withNodeTargetRootRead(editor, target, () => {
            const at = resolveReadableNodeTarget(editor, target);

            return at ? readRange(editor, at, to) : undefined;
          }),
        project: (range) =>
          (({ range: innerRange }) =>
            getEditorRuntime(editor).projectRange(innerRange))({
            range,
          }),
        unhang: (range, options = {}) =>
          (({ options: innerOptions10, range: innerRange2 }) =>
            getEditorRuntime(editor).unhangRange(innerRange2, innerOptions10))({
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

        return (getEditorDocumentRoots(editor)[root] ?? []) as ReadonlyArray<
          V[number]
        >;
      },
      runtime: Object.freeze({
        snapshot: () => getSnapshot(editor) as EditorSnapshot<V>,
      }),
      schema: getEditorSchema(editor),
      selection: selectionApi,
      slice: sliceApi,
      text: Object.freeze({
        string: (target?: NodeSelection | NodeTarget, options = {}) => {
          const resolvedTarget = target ?? getCurrentSelection(editor);

          if (!resolvedTarget) return '';
          if (SelectionApi.isNode(resolvedTarget)) {
            return withEditorRootChildren(
              editor,
              resolvedTarget.root ?? MAIN_ROOT_KEY,
              () =>
                resolvedTarget.paths
                  .map((path) => NodeApi.getIf(editor, path))
                  .filter((node): node is PliteNode => !!node)
                  .map(NodeApi.string)
                  .join('')
            );
          }
          return withNodeTargetRootRead(editor, resolvedTarget, () => {
            const at = resolveReadableNodeTarget(editor, resolvedTarget);

            if (!at) return '';

            return withLocationRootRead(editor, at, () =>
              hasLocationPath(editor, at)
                ? getEditorRuntime(editor).string(at, options)
                : ''
            );
          });
        },
      }),
      value: () =>
        withEditorDocumentProjection(editor, undefined, () =>
          getEditorDocumentValue(editor)
        ),
      view: Object.freeze({
        isComposing: () => EDITOR_COMPOSING.get(editor) ?? false,
        isFocused: () => EDITOR_FOCUSED.get(editor) ?? false,
        isReadOnly: () => EDITOR_READ_ONLY.get(editor) ?? false,
        root: () => undefined,
      }),
    } satisfies EditorCoreStateView<V>;

    const stateRecord = coreState as unknown as Record<string, unknown>;

    stateRecord.transaction = Object.assign(
      (fn: (transaction: EditorTransactionSpecBuilder<V, TPlugins>) => void) =>
        createTransactionSpec(editor, fn),
      {
        extend: (
          base: TransactionSpec,
          fn: (transaction: EditorTransactionSpecBuilder<V, TPlugins>) => void
        ) => extendTransactionSpec(editor, base, fn),
      }
    );

    STATE_VIEW_TRANSFORMS.get(owner)?.(stateRecord);

    for (const [groupName, registration] of registry.stateGroups) {
      const factoryState = createReadFactoryState(stateRecord);

      try {
        stateRecord[groupName] = freezeReadMethodTree(
          groupName,
          registration.factory(factoryState.state as never, editor)
        );
      } finally {
        factoryState.finish();
      }
    }

    state = Object.freeze(stateRecord) as EditorStateView<V, TPlugins>;
    STATE_VIEW_CACHE.set(editor, {
      registry,
      transformGeneration,
      view: state as unknown as EditorStateView,
    });

    return state;
  } finally {
    CONSTRUCTING_STATE_VIEWS.delete(editor);
  }
};

/**
 * Read the full state view without suspending an active draft.
 *
 * @internal
 */
export const getEditorStateView = <
  V extends Value,
  TPlugins extends readonly unknown[] = readonly [],
>(
  editor: Editor<V, TPlugins>
): EditorStateView<V, TPlugins> => getStateView(editor);

export const createEditorViewReadState = <T extends object>(
  editor: Editor,
  core: T
): T => {
  const state = { ...core } as Record<string, unknown>;
  for (const [name, registration] of getPluginRegistry(editor).stateGroups) {
    const factoryState = createReadFactoryState(state);
    try {
      state[name] = freezeReadMethodTree(
        name,
        registration.factory(factoryState.state as never, editor)
      );
    } finally {
      factoryState.finish();
    }
  }
  return Object.freeze(state) as T;
};

export const createEditorViewTransactionState = <T extends object>(
  editor: Editor,
  core: T,
  projectContext: (
    context: EditorUpdateContext<Editor>
  ) => EditorUpdateContext<Editor>
): T => {
  const owner = getEditorRuntimeOwner(editor);
  const scope = getTransactionSpecContext(owner);
  if (!scope) {
    throw new Error('An editor view transaction requires an active draft.');
  }
  const state = { ...createEditorViewReadState(editor, core) } as Record<
    string,
    unknown
  >;
  const registry = getPluginRegistry(editor);
  const assertActive = () =>
    assertActiveTransaction(owner, scope.snapshot.token);
  const context = projectContext(getUpdateContext(owner));
  for (const [name] of registry.stateGroups) {
    if (!registry.txGroups.has(name)) {
      state[name] = guardTransactionValue(
        state[name],
        assertActive,
        new WeakMap()
      );
    }
  }
  for (const [name, registration] of registry.txGroups) {
    const update = registration.factory(state as never, editor, context);
    assertUpdateMethodTreeProtocolKeys(name, update);
    const read = state[name];
    const group =
      read && typeof read === 'object' && update && typeof update === 'object'
        ? { ...read, ...update }
        : update;
    state[name] = guardTransactionValue(
      scope.kind === 'spec' ? getSpecSafeTransactionGroup(group) : group,
      assertActive,
      new WeakMap(),
      update
    );
  }
  return Object.freeze(state) as T;
};

const getUpdateContext = <
  V extends Value,
  TPlugins extends readonly unknown[] = readonly [],
>(
  editor: Editor<V, TPlugins>
): EditorUpdateContext<Editor<V, TPlugins>> => {
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
        handler: handler as EditorCommitHandler<Editor>,
        root: transactionRoot,
      });
    },
  });
};

const assertActiveTransaction = (editor: Editor, token: TransactionToken) => {
  if (PREPARING_COMMIT.has(getEditorRuntimeOwner(editor))) {
    throw new Error('Cannot write through a finalized editor transaction.');
  }
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
  cache: WeakMap<object, Map<unknown, object>>,
  updateValue?: unknown
): unknown => {
  if (
    (typeof value !== 'object' || value === null) &&
    typeof value !== 'function'
  ) {
    return value;
  }

  const objectValue = value;
  // The same method can occupy both a read path and a write path.
  const existing = cache.get(objectValue)?.get(updateValue);

  if (existing) {
    return existing;
  }

  const guardMember = (property: PropertyKey, member: unknown) => {
    const updateDescriptor =
      updateValue !== null &&
      (typeof updateValue === 'object' || typeof updateValue === 'function')
        ? Object.getOwnPropertyDescriptor(updateValue, property)
        : undefined;

    return guardTransactionValue(
      member,
      assertActive,
      cache,
      updateDescriptor && 'value' in updateDescriptor
        ? updateDescriptor.value
        : undefined
    );
  };
  const proxyTarget =
    typeof objectValue === 'function' ? () => {} : Object.create(null);
  const guarded = new Proxy(proxyTarget, {
    apply(_target, thisArg, args) {
      assertActive();

      const result = Reflect.apply(
        objectValue as (...args: unknown[]) => unknown,
        thisArg,
        args
      );

      if (typeof updateValue === 'function' && !isTxReadMethod(updateValue)) {
        assertSynchronousTransactionAuthorResult(result);
      }

      return result;
    },
    get(_target, property) {
      const descriptor = Object.getOwnPropertyDescriptor(objectValue, property);

      if (!descriptor || !('value' in descriptor)) return undefined;

      return guardMember(property, descriptor.value);
    },
    getOwnPropertyDescriptor(target, property) {
      const targetDescriptor = Object.getOwnPropertyDescriptor(
        target,
        property
      );

      if (targetDescriptor && !targetDescriptor.configurable) {
        return targetDescriptor;
      }
      const descriptor = Object.getOwnPropertyDescriptor(objectValue, property);

      if (!descriptor || !('value' in descriptor)) return undefined;

      return {
        configurable: true,
        enumerable: descriptor.enumerable,
        value: guardMember(property, descriptor.value),
        writable: false,
      };
    },
    has(_target, property) {
      return Object.hasOwn(objectValue, property);
    },
  });

  let variants = cache.get(objectValue);

  if (!variants) {
    variants = new Map();
    cache.set(objectValue, variants);
  }
  variants.set(updateValue, guarded);
  copyTxMethodMarkers(objectValue, guarded);

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
  TPlugins extends readonly unknown[] = readonly [],
>(
  editor: Editor<V, TPlugins>
): EditorUpdateTransaction<V, TPlugins> => {
  const transactionSnapshot = getTransactionSnapshot(editor);

  if (!transactionSnapshot) {
    throw new Error('editor transaction is no longer active');
  }

  const { token } = transactionSnapshot;
  const specContext = getTransactionSpecContext(editor);
  const existing = specContext?.updateView;

  if (existing?.token === token) {
    return existing.view as unknown as EditorUpdateTransaction<V, TPlugins>;
  }

  const assertActive = () => {
    assertActiveTransaction(editor, token);
  };
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
    const runtimeRoot = getNodeTargetRoot(editor, options?.at);
    const preResolvedOptions = runtimeRoot
      ? undefined
      : resolveNodeTargetOptions(editor, options);

    if (preResolvedOptions === null) return undefined;
    const root = runtimeRoot ?? getMutationRoot(editor, preResolvedOptions);

    return runWithMutationRoot(editor, root, () => {
      const resolvedOptions = runtimeRoot
        ? resolveNodeTargetOptions(editor, options)
        : preResolvedOptions;

      if (resolvedOptions === null) return undefined;
      const localOptions =
        resolvedOptions?.at === undefined
          ? resolvedOptions
          : ({
              ...resolvedOptions,
              at: localizeLocation(resolvedOptions.at),
            } as ResolvedNodeTargetOptions<TOptions>);

      return fn(localOptions);
    });
  };
  type NodeMutationTargetOptions = {
    at?: NodeSelection | NodeTarget;
  };
  type ResolvedNodeMutationTargetOptions<
    TOptions extends NodeMutationTargetOptions,
  > = Omit<NormalizedNodeMatchOptions<TOptions>, 'at'> & {
    at?: Location | NodeSelection;
  };
  const runNodeTargetMutation = <
    TOptions extends NodeMutationTargetOptions,
    TResult,
  >(
    options: TOptions | undefined,
    fn: (
      options: ResolvedNodeMutationTargetOptions<TOptions> | undefined
    ) => TResult
  ): TResult | undefined => {
    const currentSelection =
      options?.at === undefined ? getCurrentSelection(editor) : null;
    const nodeSelection = SelectionApi.isNode(options?.at)
      ? options.at
      : SelectionApi.isNode(currentSelection)
        ? currentSelection
        : null;

    if (!nodeSelection) {
      return runTargetMutation(
        options as (TOptions & NodeTargetOptions) | undefined,
        (resolvedOptions) =>
          fn(
            resolvedOptions as
              | ResolvedNodeMutationTargetOptions<TOptions>
              | undefined
          )
      );
    }

    assertActive();

    return runWithMutationRoot(
      editor,
      nodeSelection.root ?? MAIN_ROOT_KEY,
      () =>
        fn(
          normalizeNodeMatchOption({
            ...options,
            at: nodeSelection,
          } as TOptions) as ResolvedNodeMutationTargetOptions<TOptions>
        )
    );
  };
  const runSelectionMutation = <T>(fn: () => T) => {
    assertActive();

    return runWithMutationRoot(editor, getMutationRoot(editor), fn);
  };
  const markSelectionWritten = <T>(fn: () => T) => {
    markTransactionSelectionWritten(editor);

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
  const getDefaultBlockProps = (path: Path, root: string) => {
    let defaultBlock: Descendant | null = null;

    if (path.length === 1) {
      defaultBlock = state.schema.createDefaultRootChild(toPublicRoot(root));
    } else {
      const parent = state.nodes.parent(path)?.[0];
      const defaultChild =
        ElementApi.isElement(parent) && typeof parent.type === 'string'
          ? state.schema.element(parent.type)?.content?.default
          : null;

      if (defaultChild && defaultChild !== 'text') {
        defaultBlock = state.schema.create(defaultChild.type);
      }
    }

    if (!ElementApi.isElement(defaultBlock)) {
      const owner =
        path.length === 1
          ? `root "${root}"`
          : `parent of block at [${path.join(', ')}]`;

      throw new Error(
        `Editor ${owner} must declare an element default before a block can be reset.`
      );
    }

    return NodeApi.extractProps(defaultBlock);
  };
  const resetBlockAtPath = (
    path: Path,
    root: string,
    options: Readonly<{
      props?: Readonly<Record<string, unknown>>;
      voids?: boolean;
    }> = {}
  ) => {
    setNodes(
      editor,
      (options.props ?? getDefaultBlockProps(path, root)) as never,
      { at: path, voids: options.voids }
    );
  };
  const resetBlocks: EditorTransactionBlocksApi<V>['reset'] = (options) => {
    runNodeTargetMutation(options, (resolvedOptions) => {
      const root = getActiveUpdateRoot(editor) ?? MAIN_ROOT_KEY;
      const entries = state.nodes.blocks(resolvedOptions as never);

      for (const [, path] of entries) {
        resetBlockAtPath(path, root);
      }
    });
  };
  const toggleBlock = defineSemanticUpdateMethod<
    EditorTransactionBlocksApi<V>['toggle']
  >(
    (
      props,
      { at = getCurrentSelection(editor) ?? undefined, voids, wrap } = {}
    ) => {
      if (!at) return;
      const nodeSelection = SelectionApi.isNode(at) ? at : null;
      const targetAt = nodeSelection
        ? null
        : resolveNodeTargetLocation(editor, at as NodeTarget);

      if (!nodeSelection && !targetAt) return;
      const root = nodeSelection
        ? (nodeSelection.root ?? MAIN_ROOT_KEY)
        : targetAt
          ? (getLocationMutationRoot(editor, targetAt) ?? MAIN_ROOT_KEY)
          : MAIN_ROOT_KEY;
      const selectedBlockPaths = runWithMutationRoot(editor, root, () =>
        state.nodes
          .blocks({ at: nodeSelection ?? targetAt ?? undefined, voids })
          .map(([, path]) => path)
      );

      if (selectedBlockPaths.length === 0) return;

      const propsMatch = (node: PliteNode) =>
        NodeApi.isElement(node) && ElementApi.matches(node, props);
      const isActive = runWithMutationRoot(editor, root, () =>
        wrap
          ? selectedBlockPaths.some((path) =>
              state.nodes.some({ at: path, match: propsMatch, voids })
            )
          : selectedBlockPaths.some((path) => {
              const entry = state.nodes.get(path);

              return !!entry && propsMatch(entry[0]);
            })
      );

      if (wrap) {
        for (const path of selectedBlockPaths.toReversed()) {
          runWithMutationRoot(editor, root, () => {
            if (
              isActive &&
              !state.nodes.some({ at: path, match: propsMatch, voids })
            ) {
              return;
            }

            if (isActive) {
              unwrapNodes(editor, { at: path, match: propsMatch, voids });
            } else {
              wrapNodes(editor, { ...props, children: [] } as ElementIn<V>, {
                at: path,
                voids,
              });
            }
          });
        }

        return;
      }

      for (const path of selectedBlockPaths) {
        runWithMutationRoot(editor, root, () => {
          if (isActive) {
            const nextProps = getDefaultBlockProps(path, root);
            const propsToUnset = Object.keys(props).filter(
              (key) => key !== 'type' && !Object.hasOwn(nextProps, key)
            );

            if (propsToUnset.length > 0) {
              unsetNodes(editor, propsToUnset, { at: path, voids });
            }
            resetBlockAtPath(path, root, { props: nextProps, voids });
          } else {
            setNodes(editor, props as never, { at: path, voids });
          }
        });
      }
    },
    (command, [props, options]) => {
      command(editorCommands.toggleBlock, { options, props });
    }
  );
  let txRecord!: EditorUpdateTransaction<V, TPlugins>;
  const duplicateNodes = (
    entries: ReadonlyArray<NodeEntry<ElementOrTextIn<V>>>,
    options: NodeDuplicateOptions = {}
  ) => {
    if (entries.length === 0) return;

    const lastEntry = getDefined(entries.at(-1));
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
    const root = getActiveUpdateRoot(editor) ?? MAIN_ROOT_KEY;
    const schema = getEditorSchema(editor);
    const source = entries.map(([node, path]) =>
      schema.copyNodeAt(node, path, root)
    );

    collect(source);
    for (const [name, children] of Object.entries(roots)) {
      roots[name] = schema.copyChildren(children, name);
    }
    const slice = remapContentSliceRoots(
      editor,
      ContentSlice.fromJSON({
        content: source,
        openEnd: 0,
        openStart: 0,
        ...(Object.keys(roots).length > 0 ? { roots } : {}),
      })
    );

    txRecord.nodes.insert([...slice.content] as Array<ElementOrTextIn<V>>, {
      ...options,
      at: insertPath,
    });
    materializeContentSliceRoots(editor, slice);
  };
  const duplicateBlocks = ((
    inputOptions: BlockDuplicateOptions & {
      at?: NodeSelection | NodeTarget;
    } = {}
  ) => {
    const {
      at: explicitAt,
      hanging,
      match,
      mode,
      select: innerSelect,
      type,
      voids,
    } = inputOptions;
    const at = explicitAt ?? getCurrentSelection(editor) ?? undefined;

    if (!at) return;
    const nodeSelection = SelectionApi.isNode(at) ? at : null;
    const targetAt = nodeSelection
      ? null
      : resolveNodeTargetLocation(editor, at as NodeTarget);

    if (!nodeSelection && !targetAt) return;

    const blockMatch = normalizeNodeMatch(type, match);

    const matchesBlock = (node: PliteNode, path: Path) =>
      NodeApi.isElement(node) &&
      state.schema.isBlock(node) &&
      (!blockMatch || blockMatch(node, path));
    const entries = nodeSelection
      ? runWithMutationRoot(editor, nodeSelection.root ?? MAIN_ROOT_KEY, () =>
          nodeSelection.paths.reduce<Array<NodeEntry<Element>>>((all, path) => {
            const exact = state.nodes.get(path);
            const block =
              exact &&
              NodeApi.isElement(exact[0]) &&
              state.schema.isBlock(exact[0])
                ? (exact as NodeEntry<Element>)
                : state.nodes.block({ at: path });

            if (
              block &&
              matchesBlock(block[0], block[1]) &&
              !all.some(([, candidate]) => PathApi.equals(candidate, block[1]))
            ) {
              all.push(block);
            }

            return all;
          }, [])
        )
      : targetAt
        ? LocationApi.isRange(targetAt)
          ? state.nodes.toArray({
              at: targetAt,
              match: matchesBlock,
              mode,
              voids,
            } as never)
          : (() => {
              const entry = state.nodes.block({ at: targetAt });

              return entry && matchesBlock(entry[0], entry[1]) ? [entry] : [];
            })()
        : [];

    duplicateNodes(entries as ReadonlyArray<NodeEntry<ElementOrTextIn<V>>>, {
      hanging,
      select: innerSelect,
      voids,
    });
  }) as EditorTransactionBlocksApi<V>['duplicate'];
  const insertBlocksAfter: EditorTransactionBlocksApi<V>['insertAfter'] = (
    nodes,
    inputOptions = {}
  ) => {
    const { at: explicitAt, replaceEmpty = false, ...options } = inputOptions;
    if (Array.isArray(nodes) && nodes.length === 0) return undefined;
    const at = explicitAt ?? getCurrentSelection(editor) ?? undefined;

    const insertAt = (path: Path) => {
      const parentPath = PathApi.parent(path);
      const childCount = () => {
        if (parentPath.length === 0) return getChildren(editor).length;
        const parent = state.nodes.get(parentPath)?.[0];
        return NodeApi.isElement(parent) ? parent.children.length : 0;
      };
      const count = childCount();
      txRecord.nodes.insert(nodes, { ...options, at: path });
      return childCount() > count ? path : undefined;
    };
    const insertAfterBlock = (block: NodeEntry<Element>) => {
      const replace =
        replaceEmpty &&
        NodeApi.isText(block[0].children[0]) &&
        !state.schema.isAtom(block[0]) &&
        !state.schema.isReadOnly(block[0]) &&
        state.nodes.isEmpty(block[0]);
      const path = insertAt(PathApi.next(block[1]));
      if (!path || !replace) return path;

      // Empty-source cleanup is structural, not a suggested document deletion.
      removeNodes(editor, { at: block[1] });
      return block[1];
    };

    if (!at) {
      return insertAt([getChildren(editor).length]);
    }

    if (SelectionApi.isNode(at)) {
      const target = at.paths.at(-1);

      if (!target) return undefined;
      return runWithMutationRoot(editor, at.root ?? MAIN_ROOT_KEY, () => {
        const exactEntry = state.nodes.get(target);
        const block =
          exactEntry &&
          NodeApi.isElement(exactEntry[0]) &&
          state.schema.isBlock(exactEntry[0])
            ? (exactEntry as NodeEntry<Element>)
            : state.nodes.block({ at: target });

        if (!block) return undefined;
        return insertAfterBlock(block);
      });
    }

    return runTargetMutation({ at }, (resolvedOptions) => {
      const targetAt = resolvedOptions?.at;

      if (!targetAt) return undefined;

      const target = LocationApi.isRange(targetAt)
        ? state.points.end(targetAt)
        : targetAt;

      if (!target) return undefined;

      const exactEntry = LocationApi.isPath(target)
        ? state.nodes.get(target)
        : undefined;
      let block: NodeEntry<Element> | undefined;

      if (
        exactEntry &&
        NodeApi.isElement(exactEntry[0]) &&
        state.schema.isBlock(exactEntry[0])
      ) {
        block = exactEntry as NodeEntry<Element>;
      } else {
        block = state.nodes.block({ at: target });
      }

      if (!block) return undefined;

      return insertAfterBlock(block);
    });
  };
  const setTransactionNodes = defineSemanticUpdateMethod<
    EditorTransactionNodesApi<V>['set']
  >(
    (props, options) =>
      runNodeTargetMutation(options, (resolvedOptions) => {
        setNodes(editor, props, resolvedOptions as never);
      }),
    (command, [props, options]) =>
      command(editorCommands.setNodes, { options: options as never, props })
  );
  const setTransactionBlocks = ((
    props: Partial<Element>,
    options?: {
      at?: NodeSelection | NodeTarget;
      match?: NodeMatch<Element>;
      mode?: MaximizeMode;
      type?: NodeTypeSelector;
      voids?: boolean;
    }
  ) =>
    runNodeTargetMutation(options, (resolvedOptions) => {
      const entries = state.nodes.blocks(resolvedOptions as never);

      for (const [, path] of entries) {
        setTransactionNodes(
          props as never,
          {
            ...resolvedOptions,
            at: path,
          } as never
        );
      }
    })) as EditorTransactionBlocksApi<V>['set'];
  const unsetTransactionNodes = ((
    props: string | readonly string[] | SchemaPropertyHandle,
    options?: NodeUnsetNodesOptions<NodeIn<V>>
  ) =>
    runNodeTargetMutation(options, (resolvedOptions) => {
      unsetNodes(
        editor,
        normalizeNodeUnsetInput(
          props,
          (property) => state.schema.property(property)?.key
        ),
        resolvedOptions
      );
    })) as EditorTransactionNodesApi<V>['unset'];
  const replaceNode: EditorTransactionNodesApi<V>['replace'] = (
    nodes,
    options
  ) => {
    const at = resolveNodeTargetLocation(editor, options.at);

    if (!at || !LocationApi.isPath(at)) return;

    runMutation({ at }, () => {
      if (at.length === 0) {
        throw new Error('Cannot replace the editor root.');
      }

      const replacedNode = NodeApi.get(editor, at);
      const snapshot = getTransactionSnapshot(editor);
      if (snapshot) {
        const currentIndex = getTransactionSnapshotIndex(
          getEditorRuntimeOwner(editor),
          snapshot,
          getActiveUpdateRoot(editor) ?? MAIN_ROOT_KEY
        );
        for (const [, relativePath] of NodeApi.nodes(replacedNode)) {
          const nodeKey = currentIndex.keyAt([...at, ...relativePath]);
          if (nodeKey) snapshot.discardedNodeKeys.add(nodeKey);
        }
      }

      const replacements = Array.isArray(nodes) ? nodes : [nodes];
      const parentPath = PathApi.parent(at);
      const index = getDefined(at.at(-1));
      const newSelection =
        options.select && replacements.length > 0
          ? (() => {
              const lastNode = getDefined(replacements.at(-1));
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

      replaceChildren(editor, replacements, {
        at: parentPath,
        count: 1,
        index,
        newSelection,
      });
    });
  };
  const replaceChildrenNodes: EditorTransactionNodesApi<V>['replaceChildren'] =
    (children, options) =>
      runTargetMutation(options, (resolvedOptions) => {
        const at = resolvedOptions?.at;

        if (!at || !LocationApi.isPath(at)) return;

        replaceChildren(editor, children, { ...options, at });
      });

  const tx: EditorCoreUpdateTransaction<V> = {
    ...state,
    anchor: (value, options) =>
      runActive(() => {
        assertPublicLocationRoot(value);
        assertPublicRootKey(options.root);
        const anchor = createAnchor(editor, value, options, 'transaction');

        transactionSnapshot.scopedAnchors.add(anchor);

        return Object.freeze({
          resolve: () => {
            assertActive();

            return anchor.resolve();
          },
        });
      }),
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
      ) => {
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
        });
      },
    }),
    blocks: Object.freeze({
      duplicate: duplicateBlocks,
      insertAfter: insertBlocksAfter,
      reset: resetBlocks,
      set: setTransactionBlocks,
      toggle: toggleBlock,
    }),
    break: Object.freeze({
      insert: defineSemanticUpdateMethod<EditorTransactionBreakApi['insert']>(
        () => {
          runSelectionMutation(() => applyInsertBreak(editor));
        },
        (command) => {
          command(editorCommands.insertBreak);
        }
      ),
      insertSoft: defineSemanticUpdateMethod<
        EditorTransactionBreakApi['insertSoft']
      >(
        () => {
          runSelectionMutation(() => applyInsertSoftBreak(editor));
        },
        (command) => {
          command(editorCommands.insertSoftBreak);
        }
      ),
    }),
    changes: Object.freeze({
      apply: (change: DocumentChange) => {
        runActive(() => applyDocumentChange(editor, change));
      },
    }),
    effects: Object.freeze({
      all: () => runActive(() => getTransactionSnapshot(editor)?.effects ?? []),
      emit: <TValue>(type: EditorEffectType<TValue>, value: TValue) => {
        runActive(() => emitEditorEffect(editor, type, value));
      },
    }),
    plugins: Object.freeze({
      reconfigure: (slot, input, options) => {
        runActive(() =>
          stagePluginCandidate(
            editor,
            slot.key,
            slot.of(input),
            undefined,
            undefined,
            options
          )
        );
      },
    }),
    fragment: Object.freeze(
      Object.assign(
        (...args: Parameters<typeof state.fragment>) => state.fragment(...args),
        {
          delete: defineSemanticUpdateMethod<
            EditorTransactionFragmentApi<V>['delete']
          >(
            (options) =>
              runTargetMutation(options, (resolvedOptions) => {
                applyDeleteFragment(editor, resolvedOptions);
              }),
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
          (key, value) => {
            runSelectionMutation(() => applyAddMark(editor, key, value));
          },
          (command, [key, value]) => {
            command(editorCommands.addMark, { key, value });
          }
        ),
        remove: defineSemanticUpdateMethod<
          EditorTransactionMarksApi<V>['remove']
        >(
          (key) => {
            runSelectionMutation(() => applyRemoveMark(editor, key));
          },
          (command, [key]) => {
            command(editorCommands.removeMark, { key });
          }
        ),
        set: (marks: EditorMarks<V> | null) => {
          runSelectionMutation(() => setCurrentMarks(editor, marks));
        },
        toggle: defineSemanticUpdateMethod<
          EditorTransactionMarksApi<V>['toggle']
        >(
          (key, value) => {
            const nextValue = value === undefined ? true : value;

            runSelectionMutation(() => {
              applyToggleMark(editor, key, nextValue);
            });
          },
          (command, [key, value = true]) => {
            command(editorCommands.toggleMark, { key, value });
          }
        ),
      })
    ),
    nodes: Object.freeze({
      ...state.nodes,
      insert: defineSemanticUpdateMethod<
        EditorTransactionNodesApi<V>['insert']
      >(
        (nodes, options) =>
          runTargetMutation(options, (resolvedOptions) => {
            const runtimeOptions = resolvedOptions as
              | NodeInsertNodesOptions<PliteNode, NodeTypeSelector | undefined>
              | undefined;
            const limited = limitNodeInsert(editor, nodes, runtimeOptions);

            if (!limited || (Array.isArray(limited) && limited.length === 0)) {
              return;
            }

            (
              insertNodes as (
                editor: Editor,
                nodes: Descendant | readonly Descendant[],
                options?: NodeInsertNodesOptions<
                  PliteNode,
                  NodeTypeSelector | undefined
                >
              ) => void
            )(editor, limited, runtimeOptions);
          }),
        (command, [nodes, options]) => {
          command(editorCommands.insertNodes, {
            nodes,
            options: options as
              | NodeInsertNodesOptions<PliteNode, NodeTypeSelector | undefined>
              | undefined,
          });
        }
      ),
      lift: (options?: { at?: NodeSelection | NodeTarget }) =>
        runNodeTargetMutation(options, (resolvedOptions) => {
          liftNodes(editor, resolvedOptions as never);
        }),
      merge: (options?: { at?: NodeSelection | NodeTarget }) =>
        runNodeTargetMutation(options, (resolvedOptions) => {
          mergeNodes(editor, resolvedOptions as never);
        }),
      move: (options: { at?: NodeSelection | NodeTarget }) =>
        runNodeTargetMutation(options, (resolvedOptions) => {
          moveNodes(editor, resolvedOptions as never);
        }),
      remove: defineSemanticUpdateMethod<
        EditorTransactionNodesApi<V>['remove']
      >(
        (options: { at?: NodeSelection | NodeTarget } | undefined) =>
          runNodeTargetMutation(options, (resolvedOptions) => {
            removeNodes(editor, resolvedOptions as never);
          }),
        (command, [options]) => {
          command(editorCommands.removeNodes, { options: options as never });
        }
      ),
      replace: replaceNode,
      replaceChildren: replaceChildrenNodes,
      set: setTransactionNodes,
      split: (options?: { at?: NodeTarget }) =>
        runTargetMutation(options, (resolvedOptions) => {
          splitNodes(editor, resolvedOptions as never);
        }),
      unset: unsetTransactionNodes,
      unwrap: (options?: { at?: NodeSelection | NodeTarget }) =>
        runNodeTargetMutation(options, (resolvedOptions) => {
          unwrapNodes(editor, resolvedOptions as never);
        }),
      wrap: (
        element: ElementIn<V>,
        options?: { at?: NodeSelection | NodeTarget }
      ) =>
        runNodeTargetMutation(options, (resolvedOptions) => {
          wrapNodes(editor, element, resolvedOptions as never);
        }),
    }),
    roots: Object.freeze({
      create: (root, children) => {
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
        });
      },
      delete: (root) => {
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
        });
      },
      replace: (root, children) => {
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
        });
      },
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
      add: (tag: EditorUpdateTag) => {
        runActive(() => {
          const snapshot = getTransactionSnapshot(editor);

          if (!snapshot) {
            throw new Error('tx.tags.add can only run during editor.update');
          }

          applyEditorUpdateTag(snapshot.tags, tag);
        });
      },
      has: (tag: EditorUpdateTag) =>
        runActive(() => getTransactionSnapshot(editor)?.tags.has(tag) ?? false),
    }),
    selection: Object.freeze(
      Object.assign(() => state.selection(), {
        contains: (target: NodeTarget) => state.selection.contains(target),
        intersects: (target: NodeTarget) => state.selection.intersects(target),
        isAcrossBlocks: (options?: EditorSelectionBlockOptions) =>
          state.selection.isAcrossBlocks(options),
        isAtBlockEnd: (options?: EditorSelectionBlockOptions) =>
          state.selection.isAtBlockEnd(options),
        isAtBlockStart: (options?: EditorSelectionBlockOptions) =>
          state.selection.isAtBlockStart(options),
        isCollapsed: () => state.selection.isCollapsed(),
        isExpanded: () => state.selection.isExpanded(),
        isValid: (value: unknown) => state.selection.isValid(value),
        isWithinBlock: (options?: EditorSelectionBlockOptions) =>
          state.selection.isWithinBlock(options),
        nodes: state.selection.nodes,
        ranges: () => state.selection.ranges(),
        collapse: defineSemanticUpdateMethod<
          EditorTransactionSelectionApi['collapse']
        >(
          (options = {}) => {
            runSelectionWrite(() => collapseSelection(editor, options));
          },
          (command, [options]) => {
            command(editorCommands.collapse, { options });
          }
        ),
        move: defineSemanticUpdateMethod<EditorTransactionSelectionApi['move']>(
          (options = {}) => {
            runSelectionWrite(() => applyMove(editor, options));
          },
          (command, [options]) => {
            command(editorCommands.move, { options });
          }
        ),
        set: defineSemanticUpdateMethod<EditorTransactionSelectionApi['set']>(
          (target) => {
            if (target == null) {
              runSelectionWrite(() => {
                deselect(editor);
              });
              return;
            }

            if (SelectionApi.isSelection(target)) {
              markSelectionWritten(() => {
                runWithMutationRoot(
                  editor,
                  SelectionApi.root(target) ??
                    getActiveMutationRoot(editor) ??
                    MAIN_ROOT_KEY,
                  () => select(editor, target)
                );
              });
              return;
            }

            if (
              typeof target === 'object' &&
              target !== null &&
              Object.hasOwn(target, 'kind')
            ) {
              assertSelectionSupported(editor, target);
            }

            if (RangeApi.isRange(target)) {
              markSelectionWritten(() => {
                runLocationMutation(target, () => select(editor, target));
              });
              return;
            }

            markSelectionWritten(() => {
              runLocationMutation(target, () => select(editor, target));
            });
          },
          (command, [target], primitive) => {
            if (target == null) {
              primitive(target);
              return;
            }

            command(editorCommands.select, { target });
          }
        ),
        setNodes: (
          ...[targets, options]: Parameters<
            EditorTransactionSelectionApi['setNodes']
          >
        ) => {
          runSelectionWrite(() => {
            if (targets.length === 0) {
              deselect(editor);
              return;
            }

            const fallbackRoot =
              getCurrentChildrenRoot(editor) ??
              getActiveMutationRoot(editor) ??
              MAIN_ROOT_KEY;
            const directionalTargets = options
              ? [options.anchor, options.focus]
              : [];
            const targetRoots = [...targets, ...directionalTargets].map(
              (target) =>
                PathApi.isPath(target)
                  ? fallbackRoot
                  : getSelectionNodeTargetRoot(editor, target)
            );
            const root = targetRoots[0];

            if (!root || targetRoots.some((candidate) => candidate !== root)) {
              throw new Error(
                'Node selection targets must be live nodes in one editor root.'
              );
            }

            runWithMutationRoot(editor, root, () => {
              const resolveSelectedPath = (
                target: (typeof targets)[number]
              ) => {
                const location = resolveNodeTargetLocation(editor, target);

                if (!location || !PathApi.isPath(location)) {
                  throw new Error(
                    'Node selection targets must resolve to live node paths.'
                  );
                }
                if (!state.nodes.get(location)) {
                  throw new Error(
                    `Cannot select a missing node at path ${JSON.stringify(
                      location
                    )}.`
                  );
                }

                return location;
              };
              const paths = targets.map(resolveSelectedPath);
              const firstPath = paths[0];

              if (!firstPath) return;
              const endpoints = options
                ? {
                    anchorPath: resolveSelectedPath(options.anchor),
                    focusPath: resolveSelectedPath(options.focus),
                  }
                : null;

              if (
                endpoints &&
                !paths.some((path) =>
                  PathApi.equals(path, endpoints.anchorPath)
                )
              ) {
                throw new Error(
                  'Node selection anchor must be one of the selected targets.'
                );
              }
              if (
                endpoints &&
                !paths.some((path) => PathApi.equals(path, endpoints.focusPath))
              ) {
                throw new Error(
                  'Node selection focus must be one of the selected targets.'
                );
              }

              const publicRoot = toPublicRoot(root);
              select(
                editor,
                SelectionApi.nodes(
                  [firstPath, ...paths.slice(1)],
                  endpoints
                    ? {
                        anchorPath: endpoints.anchorPath,
                        focusPath: endpoints.focusPath,
                        ...(publicRoot ? { root: publicRoot } : {}),
                      }
                    : publicRoot
                      ? { root: publicRoot }
                      : {}
                )
              );
            });
          });
        },
        setPoint: (
          ...args: Parameters<EditorTransactionSelectionApi['setPoint']>
        ) => {
          runSelectionWrite(() => setPoint(editor, ...args));
        },
      }) satisfies EditorTransactionSelectionApi
    ),
    setField: <TValue>(
      field: EditorStateField<TValue>,
      value: StateFieldValueInput<TValue>
    ) => {
      runActive(() => setStateFieldValue(editor, field, value));
    },
    text: Object.freeze({
      ...state.text,
      delete: (options = {}) =>
        runTargetMutation(options, (resolvedOptions) => {
          deleteText(editor, resolvedOptions);
        }),
      deleteBackward: defineSemanticUpdateMethod<
        EditorTransactionTextApi['deleteBackward']
      >(
        (options = {}) => {
          runSelectionMutation(() =>
            applyDelete(editor, {
              direction: 'backward',
              unit: options.unit ?? 'character',
            })
          );
        },
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
        (options = {}) => {
          runSelectionMutation(() =>
            applyDelete(editor, {
              direction: 'forward',
              unit: options.unit ?? 'character',
            })
          );
        },
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
        replace: (input: SnapshotInput<V>) => {
          runActive(() => replaceSnapshot(editor, input));
        },
      })
    ),
  };

  txRecord = tx as unknown as EditorUpdateTransaction<V, TPlugins>;
  const txPluginRecord = txRecord as unknown as Record<string, unknown>;

  if (specContext?.kind === 'update') {
    txPluginRecord.command = (
      command: EditorCommand<unknown>,
      input?: unknown
    ) =>
      runActive(() =>
        Reflect.apply(getEditorRuntime(editor).runCommand, undefined, [
          command,
          input,
        ])
      );
  }

  const pluginRegistry = getPluginRegistry(editor);

  for (const [groupName] of pluginRegistry.stateGroups) {
    if (pluginRegistry.txGroups.has(groupName)) continue;

    txPluginRecord[groupName] = guardTransactionValue(
      txPluginRecord[groupName],
      assertActive,
      new WeakMap()
    );
  }

  for (const [groupName, registration] of pluginRegistry.txGroups) {
    const updateGroup = registration.factory(
      txPluginRecord as never,
      editor,
      getUpdateContext(editor)
    );

    assertUpdateMethodTreeProtocolKeys(groupName, updateGroup);
    const readGroup = txPluginRecord[groupName];
    const group =
      typeof readGroup === 'object' &&
      readGroup !== null &&
      typeof updateGroup === 'object' &&
      updateGroup !== null
        ? { ...readGroup, ...updateGroup }
        : updateGroup;

    txPluginRecord[groupName] = guardTransactionValue(
      specContext?.kind === 'spec' ? getSpecSafeTransactionGroup(group) : group,
      assertActive,
      new WeakMap(),
      updateGroup
    );
  }

  const directPluginGroup = txPluginRecord.plugin;
  const pluginPortal = (plugin: PluginReference | string) => {
    const name = typeof plugin === 'string' ? plugin : plugin.name;
    const installed =
      typeof plugin === 'string'
        ? pluginRegistry.plugins.get(plugin)
        : pluginRegistry.pluginsByDescriptor.get(plugin);

    if (!installed) {
      throw new Error(
        `Editor plugin "${name}" is not installed on this editor.`
      );
    }
    const group =
      installed.name === 'plugin'
        ? directPluginGroup
        : txPluginRecord[installed.name];

    if (group === undefined) {
      throw new Error(
        `Editor plugin "${installed.name}" does not expose transaction methods.`
      );
    }

    return group;
  };

  txPluginRecord.plugin =
    (typeof directPluginGroup === 'object' && directPluginGroup !== null) ||
    typeof directPluginGroup === 'function'
      ? new Proxy(pluginPortal, {
          get(target, property, receiver) {
            if (Reflect.has(directPluginGroup, property)) {
              return Reflect.get(
                directPluginGroup,
                property,
                directPluginGroup
              );
            }

            return Reflect.get(target, property, receiver);
          },
        })
      : pluginPortal;

  TRANSACTION_VIEW_TRANSFORMS.get(getEditorRuntimeOwner(editor))?.(
    txPluginRecord
  );

  const view = Object.freeze(txRecord) as EditorUpdateTransaction<V, TPlugins>;
  if (!specContext) {
    throw new Error('Missing editor transaction draft.');
  }
  specContext.updateView = { token, view };
  return view;
};

export const getActiveUpdateView = <
  V extends Value,
  TPlugins extends readonly unknown[] = readonly [],
>(
  editor: Editor<V, TPlugins>
): EditorUpdateTransaction<V, TPlugins> => {
  if (!isInTransaction(editor)) {
    throw new Error(
      'The active transaction is only available during editor.update'
    );
  }

  return getUpdateView(editor);
};

export const getActiveEditorTransaction = <
  V extends Value,
  TPlugins extends readonly unknown[] = readonly [],
>(
  editor: Editor<V, TPlugins>
): EditorUpdateTransaction<V, TPlugins> | null => {
  const owner = getEditorRuntimeOwner(editor) as Editor<V, TPlugins>;

  return isInTransaction(owner) ? getUpdateView(owner) : null;
};

/**
 * Whether writes currently target an immutable detached spec.
 *
 * @internal
 */
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
    discardedNodeKeys: new Set(),
    scopedAnchors: new Set(),
    effects: [],
    pluginReconfigurations: new Map(),
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
  closeScopedTransactionAnchors(context.snapshot);
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

/**
 * Publish the canonical representation of the active draft.
 *
 * @internal
 */
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
  const schema: InternalEditorSchemaApi = getEditorSchema(editor);
  const before = getChangeValue(snapshot.roots) as EditorDocumentValue;
  const after = snapshot.builder.value as EditorDocumentValue;
  const { change } = snapshot.builder;
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

  if (snapshot.pluginReconfigurations.size > 0) {
    throw new Error('Transaction specs cannot reconfigure editor plugins.');
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
  if (snapshot.afterCommitHandlers.length > 0) {
    TRANSACTION_SPEC_AFTER_COMMIT_HANDLERS.set(
      spec,
      Object.freeze([...snapshot.afterCommitHandlers])
    );
  }
  PREPARED_TRANSACTION_SPECS.set(
    spec,
    Object.freeze({
      deferValidation: context.parentId !== undefined,
      discardedNodeKeys: new Set(snapshot.discardedNodeKeys),
      document: snapshot.builder.prepare(changes, { classify: false }),
    })
  );

  return spec;
};

/**
 * Whether a value is an opaque spec minted by this runtime.
 *
 * @internal
 */
export const isTransactionSpec = (value: unknown): value is TransactionSpec =>
  typeof value === 'object' &&
  value !== null &&
  TRANSACTION_SPEC_BASE.has(value as TransactionSpec);

/**
 * Materialize one detached spec as the full persisted document.
 *
 * @internal
 */
export const applyTransactionSpecToDocument = (
  editor: Editor,
  spec: TransactionSpec,
  value: EditorDocumentValue
): EditorDocumentValue => {
  const document = spec.changes.apply(value);

  if (!TRANSACTION_SPEC_DOCUMENT_STATES.has(spec)) return document;

  return createEditorDocumentValue({
    children: document.children,
    fields: getStateFieldIdentityMap(editor),
    meta: TRANSACTION_SPEC_DOCUMENT_STATES.get(spec),
    roots: {
      [MAIN_ROOT_KEY]: document.children,
      ...document.roots,
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

  for (const nodeKey of prepared.discardedNodeKeys) {
    snapshot.discardedNodeKeys.add(nodeKey);
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

  const afterCommitHandlers = TRANSACTION_SPEC_AFTER_COMMIT_HANDLERS.get(spec);

  if (afterCommitHandlers && snapshot) {
    snapshot.afterCommitHandlers.push(...afterCommitHandlers);
  }

  if (spec.annotations.length > 0 || spec.tags.length > 0) {
    const tx = getUpdateView(editor);

    for (const annotation of spec.annotations) {
      tx.annotations.set(annotation.type, annotation.value);
    }
    for (const tag of spec.tags) {
      tx.tags.add(tag);
    }
  }
};

const buildTransactionSpec = <
  V extends Value,
  TPlugins extends readonly unknown[],
>(
  editor: Editor<V, TPlugins>,
  fn: (transaction: EditorTransactionSpecBuilder<V, TPlugins>) => void,
  baseSpec?: TransactionSpec
): TransactionSpec => {
  if (baseSpec) assertTransactionSpecBase(editor, baseSpec);

  const context = profileCoreDuration('transaction-spec-context', () =>
    createTransactionSpecContext(editor)
  );

  try {
    if (baseSpec) applyTransactionSpecContents(editor, baseSpec);
    profileCoreDuration('transaction-spec-callback', () => {
      const author: (
        transaction: EditorTransactionSpecBuilder<V, TPlugins>
      ) => unknown = fn;

      assertSynchronousTransactionAuthorResult(author(getUpdateView(editor)));
    });

    const spec = profileCoreDuration('transaction-spec-finalize', () =>
      finalizeTransactionSpecContext(editor, context)
    );

    if (baseSpec) TRANSACTION_SPEC_PARENT.set(spec, baseSpec);

    return spec;
  } finally {
    disposeTransactionSpecContext(editor, context);
  }
};

/**
 * Whether a spec explicitly continues one delegated ancestor.
 *
 * @internal
 */
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
  TPlugins extends readonly unknown[],
>(
  editor: Editor<V, TPlugins>,
  fn: (transaction: EditorTransactionSpecBuilder<V, TPlugins>) => void
): TransactionSpec => buildTransactionSpec(editor, fn);

/** Continue a spec from the same editor revision on one isolated draft. */
export const extendTransactionSpec = <
  V extends Value,
  TPlugins extends readonly unknown[],
>(
  editor: Editor<V, TPlugins>,
  base: TransactionSpec,
  fn: (transaction: EditorTransactionSpecBuilder<V, TPlugins>) => void
): TransactionSpec => buildTransactionSpec(editor, fn, base);

/**
 * Continue command dispatch against one prepared immutable spec.
 *
 * @internal
 */
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

/**
 * Rebase a non-document result from a discarded transaction prefix.
 *
 * @internal
 */
export const rebaseTransactionSpecWithoutChanges = (
  editor: Editor,
  prefix: TransactionSpec,
  result: TransactionSpec
): TransactionSpec => {
  assertTransactionSpecBase(editor, prefix);
  const resultBase = TRANSACTION_SPEC_BASE.get(result);

  if (!resultBase || resultBase.editor !== editor) {
    throw new Error(
      'Cannot rebase a transaction spec from a different editor.'
    );
  }
  if (resultBase.revision !== getMutationVersion(editor)) {
    throw new Error('Cannot rebase a stale transaction spec.');
  }

  if (!result.changes.empty) {
    throw new Error('Cannot discard a prefix from a document-changing spec.');
  }

  const inverse = prefix.changes.invert(getEditorDocumentValue(editor));
  const effects = result.effects.flatMap((effect) => {
    const mapped = prefix.changes.empty ? effect : mapEffect(effect, inverse);

    return mapped ? [mapped] : [];
  });
  const rebased = createTransactionSpec(editor, (tx) => {
    for (const annotation of result.annotations) {
      tx.annotations.set(annotation.type, annotation.value);
    }
    for (const effect of effects) {
      tx.effects.emit(effect.type, effect.value);
    }
    for (const tag of result.tags) tx.tags.add(tag);
  });
  const afterCommitHandlers =
    TRANSACTION_SPEC_AFTER_COMMIT_HANDLERS.get(result);

  if (afterCommitHandlers) {
    TRANSACTION_SPEC_AFTER_COMMIT_HANDLERS.set(rebased, afterCommitHandlers);
  }

  return rebased;
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
  TPlugins extends readonly unknown[] = readonly [],
>(
  editor: Editor<V, TPlugins>
): EditorCorrectionTransaction<V, TPlugins> => {
  const tx = getUpdateView(editor);
  const txRecord = tx as unknown as Record<string, unknown>;
  const installedGroups = Object.fromEntries(
    Array.from(
      getPluginRegistry(editor).txGroups.keys(),
      (groupName) => [groupName, txRecord[groupName]] as const
    )
  );

  return Object.freeze({
    ...installedGroups,
    anchor: tx.anchor,
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
  }) as EditorCorrectionTransaction<V, TPlugins>;
};

export const readEditor = <
  V extends Value,
  TPlugins extends readonly unknown[] = readonly [],
  T = unknown,
>(
  editor: Editor<V, TPlugins>,
  fn: (state: EditorStateView<V, TPlugins>) => T
): T => {
  const exitRead = enterEditorRead(editor);
  const restoreDraft =
    (TRANSACTION_SPEC_DRAFT_READ_DEPTH.get(editor) ?? 0) === 0
      ? suspendTransactionSpecDraft(editor)
      : () => {};

  try {
    return withEditorDocumentProjection(editor, undefined, () =>
      withAuthoredViewRead(editor, editor, () => fn(getStateView(editor)))
    );
  } finally {
    restoreDraft();
    exitRead();
  }
};

export const updateEditor = <
  V extends Value,
  TPlugins extends readonly unknown[] = readonly [],
>(
  editor: Editor<V, TPlugins>,
  fn: (
    transaction: EditorUpdateTransaction<V, TPlugins>,
    context: EditorUpdateContext<Editor<V, TPlugins>>
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
      () => {
        const tx = getUpdateView(editor);
        const author: (
          transaction: EditorUpdateTransaction<V, TPlugins>,
          context: EditorUpdateContext<Editor<V, TPlugins>>
        ) => unknown = fn;

        prepareAuthoredViewUpdate(editor);
        return author(tx, getUpdateContext(editor));
      },
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
  TPlugins extends readonly unknown[] = readonly [],
>(
  editor: Editor<V, TPlugins>,
  fn: (
    transaction: EditorUpdateTransaction<V, TPlugins>,
    context: EditorUpdateContext<Editor<V, TPlugins>>
  ) => void,
  options: Pick<InternalEditorUpdateOptions, 'tags'> = {}
) => {
  const owner = getEditorRuntimeOwner(editor) as Editor<V, TPlugins>;
  const snapshot = getTransactionSnapshot(owner);

  if (snapshot) {
    snapshot.skipCorrections = true;
    applyEditorUpdateTags(snapshot.tags, options.tags ?? []);
    fn(getUpdateView(owner), getUpdateContext(owner));
    return;
  }

  getEditorRuntime(owner).update(
    (transaction, context) => {
      fn(transaction as EditorUpdateTransaction<V, TPlugins>, context);
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
    if (context.currentChildrenRoot === targetRoot) return undefined;

    const previousRoot = context.currentChildrenRoot;
    const previousActiveRoot = context.activeChildrenRoot;

    context.currentChildrenRoot = targetRoot;
    context.activeChildrenRoot = targetRoot;

    return () => {
      context.currentChildrenRoot = previousRoot;
      context.activeChildrenRoot = previousActiveRoot;
    };
  }

  if (READ_PROJECTIONS.has(getEditorRuntimeOwner(editor))) {
    const previousRoot = CURRENT_CHILDREN_ROOT.get(editor);
    const previousActive = ACTIVE_CHILDREN_ROOT.get(editor);
    CURRENT_CHILDREN_ROOT.set(editor, targetRoot);
    ACTIVE_CHILDREN_ROOT.set(editor, targetRoot);
    return () => {
      if (previousRoot === undefined) CURRENT_CHILDREN_ROOT.delete(editor);
      else CURRENT_CHILDREN_ROOT.set(editor, previousRoot);
      if (previousActive === undefined) ACTIVE_CHILDREN_ROOT.delete(editor);
      else ACTIVE_CHILDREN_ROOT.set(editor, previousActive);
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
    return undefined;
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
    withEditorUpdateRoot(editor, root, () => {
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
      });
    });
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
  const context = getTransactionSpecContext(editor);

  if (context) {
    context.selection = cloneValue(selection);
    context.selectionRoot = root;
  } else {
    setSelectionStateSelection(editor, selection, root);
  }
};

export const getCurrentMarks = (editor: Editor): EditorMarks | null => {
  const selection = getCurrentSelection(editor);

  return SelectionApi.isText(selection) && RangeApi.isCollapsed(selection)
    ? (cloneValue(selection.marks) ?? null)
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

  markTransactionSelectionWritten(editor);
  setCurrentSelection(editor, nextSelection, getCurrentSelectionRoot(editor));
  syncImplicitTargetToCurrentSelection(editor);
};

export const getCurrentSelection = (editor: Editor): Selection => {
  const owner = getEditorRuntimeOwner(editor);
  const context = getTransactionSpecContext(owner);

  return cloneValue(
    context
      ? context.selection
      : (READ_SELECTIONS.get(owner)?.selection ??
          (READ_SELECTIONS.has(owner)
            ? null
            : getSelectionStateSelection(owner)))
  );
};

export const getCurrentSelectionRoot = (editor: Editor): string => {
  const owner = getEditorRuntimeOwner(editor);

  return (
    getTransactionSpecContext(owner)?.selectionRoot ??
    READ_SELECTIONS.get(owner)?.root ??
    getSelectionStateRoot(owner)
  );
};

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

const setEditorViewStateFlag = (
  editor: AnyPluginEditor,
  key: 'composing' | 'focused' | 'readOnly',
  value: boolean,
  fallback: WeakMap<AnyPluginEditor, boolean>
) => {
  const { setViewState } = getEditorRuntime(editor);
  if (setViewState) {
    const changed = setViewState(key, value);
    if (changed) notifyEditorViewState(editor, key);
    return changed;
  }
  if ((fallback.get(editor) ?? false) === value) return false;
  fallback.set(editor, value);
  notifyEditorViewState(editor, key);
  return true;
};

export const setEditorComposing = (
  editor: AnyPluginEditor,
  composing: boolean
) => {
  const changed = setEditorViewStateFlag(
    editor,
    'composing',
    composing,
    EDITOR_COMPOSING
  );
  if (!changed) return;
  if (composing) updateAuthoredComposition(editor, true);
  else scheduleMicrotask(() => updateAuthoredComposition(editor, false));
};

export const setEditorFocused = (editor: AnyPluginEditor, focused: boolean) => {
  setEditorViewStateFlag(editor, 'focused', focused, EDITOR_FOCUSED);
};

const normalizeEditorMaxLength = (maxLength: number | undefined) => {
  if (maxLength === undefined) {
    return undefined;
  }

  if (!Number.isSafeInteger(maxLength) || maxLength < 0) {
    throw new Error('[Plite] maxLength must be a non-negative safe integer.');
  }

  return maxLength;
};

export const getEditorMaxLength = (
  editor: AnyPluginEditor
): number | undefined => EDITOR_MAX_LENGTH.get(editor);

export const setEditorMaxLength = (
  editor: AnyPluginEditor,
  maxLength: number | undefined
) => {
  EDITOR_MAX_LENGTH.set(editor, normalizeEditorMaxLength(maxLength));
};

export const setEditorReadOnly = (
  editor: AnyPluginEditor,
  readOnly: boolean
) => {
  setEditorViewStateFlag(editor, 'readOnly', readOnly, EDITOR_READ_ONLY);
};

export const notifyEditorViewState = (
  editor: AnyPluginEditor,
  change: EditorViewStateChange
) => {
  const runtime = getEditorRuntime(editor);
  scheduleMicrotask(() => {
    EDITOR_VIEW_STATE_LISTENERS.get(runtime)?.forEach((listener) => {
      listener(change);
    });
  });
};

export const subscribeEditorViewState = <V extends Value>(
  editor: Editor<V>,
  listener: (change: EditorViewStateChange) => void
) => {
  const runtime = getEditorRuntime(editor);
  const listeners = EDITOR_VIEW_STATE_LISTENERS.get(runtime) ?? new Set();

  listeners.add(listener);
  EDITOR_VIEW_STATE_LISTENERS.set(runtime, listeners);

  return () => {
    listeners.delete(listener);

    if (listeners.size === 0) {
      EDITOR_VIEW_STATE_LISTENERS.delete(runtime);
    }
  };
};

export const getPublicSelection = (editor: Editor): Range | null =>
  getSelectionRange(
    editor,
    getCurrentSelection(editor),
    getEditorDocumentValue(editor)
  );

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

/**
 * Replace bootstrap selection without creating mutation authority.
 *
 * @internal
 */
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

/**
 * Invalidate detached specs after one successful bootstrap.
 *
 * @internal
 */
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
    association?: 'backward' | 'forward' | 'inward' | 'outward';
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
    resolveTarget(options: { at?: Location | NodeSelection } = {}) {
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
      markTransactionSelectionWritten(editor);
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
  const projection = getReadProjection(editor);
  if (projection) {
    const root = getCurrentChildrenRoot(editor);
    let snapshots = PROJECTION_SNAPSHOTS.get(projection);
    if (!snapshots) {
      snapshots = new Map();
      PROJECTION_SNAPSHOTS.set(projection, snapshots);
    }
    const previous = snapshots.get(root);
    const selection = getCurrentSelection(editor);
    const version = getVersion(editor);
    if (
      previous?.version === version &&
      SelectionApi.equals(previous.selection, selection)
    ) {
      return previous;
    }
    const children = getChildren(editor);
    let index: SnapshotIndex | undefined;
    const snapshot: EditorSnapshot = Object.freeze({
      children,
      selection,
      version,
      get index() {
        return (index ??= getEditorProjectionSnapshotIndex(editor, children));
      },
    });
    snapshots.set(root, snapshot);
    return snapshot;
  }
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

    if (!node) return undefined;

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
  const nodeKey = getOrCreateNodeKey(node, editor);
  const previousPath = previousSnapshot.index.pathOf(nodeKey);
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

  inheritNodeKey(nextNode, node, editor);

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
  previousSnapshot: EditorSnapshot,
  version = getVersion(editor)
): EditorSnapshot => {
  const snapshot = {
    children: previousSnapshot.children,
    selection: cloneFrozenEditorJsonValue(getCurrentSelection(editor)),
    version,
  };

  // Share the lazy index without retaining a getter chain through every selection.
  Object.defineProperty(
    snapshot,
    'index',
    getDefined(Object.getOwnPropertyDescriptor(previousSnapshot, 'index'))
  );

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
    leftEntries.every(([nodeKey, path]) => right.keyAt(path) === nodeKey)
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
  knownIndex?: SnapshotIndex,
  version = getVersion(editor)
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
    version,
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
  Array<
    Readonly<{
      roots: ReadonlyArray<readonly [string, readonly Descendant[]]>;
      value: JsonEditorValue;
    }>
  >
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
          root === rootEntries[index][0] && value === rootEntries[index][1]
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

  const { change } = snapshot.activeChange;

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

  if (!paths?.length) return undefined;
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
  const revision = getPluginRegistry(editor);
  const schema: InternalEditorSchemaApi = getEditorSchema(editor);
  const validation = options.validation ?? 'incremental';
  const assertRevision = () => {
    if (getPluginRegistry(editor) !== revision) {
      throw new Error(
        'Document construction cannot cross an editor schema revision.'
      );
    }
  };

  return new ChangeDraft(value, {
    adoptCanonicalBaseline: (candidate) => {
      schema.adoptDocumentBaseline(candidate as EditorDocumentValue);
    },
    assertCanonical: (candidate, change) => {
      assertRevision();
      if (
        !constructCanonicalDocumentChange(editor, candidate, change, {
          before: value,
          preserveInlineSpacersAdjacentTo: (root) =>
            getProtectedInlineSpacerNodes(editor, candidate, root),
        }).empty
      ) {
        throw new Error(
          'Document changes must already use canonical editor representation.'
        );
      }
    },
    construct: (
      { after, before, change, indexedAfter, indexedBefore },
      preparation
    ) => {
      assertRevision();

      return constructCanonicalDocumentChange(editor, after, change, {
        before,
        fitPreparation: preparation,
        indexedAfter,
        indexedBefore,
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
            schema.assertDocument(candidate);
          },
          validateConstructed: ({
            after,
            before,
            change,
            indexedAfter,
            indexedBefore,
          }) => {
            assertRevision();
            profileCoreDuration('schema-validation-incremental', () => {
              schema.validateDocumentChange({
                after: after as EditorDocumentValue,
                before: before as EditorDocumentValue,
                change,
                indexedAfter,
                indexedBefore,
              });
            });
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
      nodeKeyTransfers?: ReadonlyArray<
        Readonly<{
          path: Path;
          source: Descendant;
        }>
      >;
    }> = {}
) => {
  const root = getActiveUpdateRoot(editor) ?? MAIN_ROOT_KEY;
  const step = profileCoreDuration('document-change-build', () =>
    build(getActiveDocumentChangeBuilder(editor), root)
  );
  const { nodeKeyTransfers, ...applyOptions } = options;

  if (nodeKeyTransfers) {
    const children = getDocumentRootChildren(step.after, root);
    const owner = getEditorRuntimeOwner(editor);

    for (const transfer of nodeKeyTransfers) {
      const node = NodeApi.get({ children } as PliteNode, transfer.path);

      inheritNodeKeys(node as Descendant, transfer.source, owner);
    }
  }

  applyDocumentChangeStep(editor, step, applyOptions);
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
      ).map((path) => Object.freeze([...path]))
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
            ...getPluginRegistry(editor).transactionChangeListeners,
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
  listener: import('../interfaces/editor').EditorTransactionChangeHandler<Editor>,
  fn: () => T
): T => {
  const snapshot = getTransactionSnapshot(editor);

  if (!snapshot) {
    throw new Error(
      'Transaction document-change observers require an active transaction.'
    );
  }

  const scopedListener: typeof listener = (context) => {
    listener(context);
  };

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

const inheritDocumentChangeStepNodeKeys = (
  editor: Editor,
  snapshot: TransactionSnapshot,
  step: DocumentChangeStep,
  options: Readonly<{ defer?: boolean }> = {}
) => {
  const owner = getEditorRuntimeOwner(editor);
  const publishNodeKeys = getTransactionSpecContext(editor)?.kind !== 'spec';
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
            const beforeNode = before.node(path);
            const afterNode = after.node(path);

            return (
              ('children' in beforeNode ? beforeNode.type : undefined) !==
              ('children' in afterNode ? afterNode.type : undefined)
            );
          } catch {
            return false;
          }
        });
      const pathStable =
        publishNodeKeys &&
        classification &&
        !classification.structure &&
        !changesElementType &&
        snapshot.discardedNodeKeys.size === 0;

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
              snapshot.discardedNodeKeys,
              step.runtimeCandidates.get(root),
              publishNodeKeys
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

    if (!currentIndex && !baseIndex) {
      snapshot.baseRuntimeIndexes[root] = () => resolvedSourceIndex;
    }

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
    ...after.roots,
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
      : 'transaction-node-keys',
    () =>
      inheritDocumentChangeStepNodeKeys(editor, snapshot, step, {
        defer: specContext.kind === 'spec' && hasExplicitSelection,
      })
  );
  const selectionRuntimeIndexes = runtimeIndexes.get(selectionRoot);
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
      association: options.selectionAssociation,
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
            ...getPluginRegistry(editor).transactionChangeListeners,
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

  const step = snapshot.builder.applyCanonical(change);

  applyTransactionSpecDocumentChangeStep(editor, step, options);
};

const runEditorObserver = (
  editor: Editor,
  phase:
    | 'after-commit'
    | 'commit-listener'
    | 'snapshot-listener'
    | 'source-listener',
  observer: () => void
) => {
  try {
    observer();
  } catch (error) {
    reportEditorLifecycleError(
      Object.freeze({
        cause: error,
        editor,
        pluginName: '$editor',
        phase,
      })
    );
  }
};

export const notifyListeners = (editor: Editor, change?: EditorCommit) => {
  COMMIT_NOTIFICATION_DEPTH.set(
    editor,
    (COMMIT_NOTIFICATION_DEPTH.get(editor) ?? 0) + 1
  );

  try {
    const listeners = getSnapshotListeners(editor);
    const sourceListeners = getSourceListeners(editor);
    const pluginCommitListeners = change
      ? getPluginRegistry(editor).commitListeners
      : null;
    const hasAnySourceListeners =
      sourceListeners !== undefined &&
      [...sourceListeners.values()].some(
        (innerListeners) => innerListeners.size > 0
      );
    const sourcesForChange =
      change && hasAnySourceListeners ? getSourcesForChange(change) : [];
    const hasSourceListenersForChange = sourcesForChange.some(
      (source) => (sourceListeners?.get(source)?.size ?? 0) > 0
    );
    const hasSnapshotListeners =
      (listeners && listeners.size > 0) || hasSourceListenersForChange;
    const pluginCommitListenersNeedSnapshot =
      pluginCommitListeners &&
      [...pluginCommitListeners].some((listener) => listener.length >= 2);

    let snapshot: EditorSnapshot | null = null;
    const getSnapshotForListeners = () => {
      snapshot ??= profileCoreDuration('listener-snapshot', () =>
        getListenerSnapshot(editor, change)
      );

      return snapshot;
    };

    if (change) {
      LAST_COMMIT.set(editor, change);

      profileCoreDuration('notify-plugin-commit-listeners', () => {
        for (const listener of pluginCommitListeners ?? []) {
          if (listener.length >= 2) {
            listener(change, getSnapshotForListeners());
          } else {
            (listener as (commit: EditorCommit) => void)(change);
          }
        }
      });

      profileCoreDuration('notify-commit-listeners', () => {
        for (const listener of getCommitListeners(editor) ?? []) {
          runEditorObserver(editor, 'commit-listener', () => {
            listener(change, getSnapshotForListeners());
          });
        }
      });
    }

    if (hasSnapshotListeners || pluginCommitListenersNeedSnapshot) {
      if ((listeners?.size ?? 0) > 0 || pluginCommitListenersNeedSnapshot) {
        getSnapshotForListeners();
      }

      profileCoreDuration('notify-snapshot-listeners', () => {
        for (const listener of listeners ?? []) {
          runEditorObserver(editor, 'snapshot-listener', () => {
            listener(getSnapshotForListeners(), change);
          });
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
                runEditorObserver(editor, 'source-listener', () => {
                  listener(getSnapshotForListeners(), change);
                });
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
      },
      handler,
    };
  });
};

const runAfterCommitHandlers = (
  handlers: readonly MaterializedAfterCommitHandler[]
) => {
  for (const { context, handler } of handlers) {
    runEditorObserver(context.editor, 'after-commit', () => {
      handler(context);
    });
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
  const cachedSnapshots = new Map(SNAPSHOT_CACHE.get(editor));

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
    discardedNodeKeys: new Set(),
    dirtyStateKeys: new Set(),
    scopedAnchors: new Set(),
    effects: [],
    pluginReconfigurations: new Map(),
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

export const setTransactionDocumentProjection = (
  editor: Editor,
  value: EditorDocumentValue
) => {
  const context = getTransactionSpecContext(editor);
  if (!context || context.kind !== 'update') {
    throw new Error(
      'Authored proposal intent requires an active editor update.'
    );
  }
  const { snapshot } = context;
  if (!snapshot.activeChange.change.empty || snapshot.publicationBase) {
    throw new Error(
      'Set authored proposal intent before the first document mutation.'
    );
  }
  snapshot.publicationBase = {
    baseRuntimeIndexes: snapshot.baseRuntimeIndexes,
    baseSnapshots: snapshot.baseSnapshots,
    previousSnapshot: snapshot.previousSnapshot,
    roots: snapshot.roots,
    selection: snapshot.selection,
    selectionRoot: snapshot.selectionRoot,
  };
  snapshot.roots = { [MAIN_ROOT_KEY]: value.children, ...value.roots };
  snapshot.rootIndexes = {};
  snapshot.baseRuntimeIndexes = {};
  snapshot.baseSnapshots = {};
  snapshot.builder = createEditorDocumentChangeBuilder(editor, value);
  snapshot.activeChange = { change: snapshot.builder.change };
  snapshot.previousSnapshot = null;
  snapshot.previousSnapshot = getTransactionRootSnapshot(
    editor,
    snapshot,
    snapshot.childrenRoot
  );
  context.exitAnchorScope();
  context.exitAnchorScope = enterAnchorScope(editor, value);
};

export const setTransactionViewSelection = (
  editor: Editor,
  selection: Selection,
  root: string
) => {
  const context = getTransactionSpecContext(editor);
  if (!context) {
    throw new Error('A view selection requires an active transaction.');
  }
  context.selection = cloneValue(selection);
  context.selectionRoot = root;
  syncImplicitTargetToCurrentSelection(editor);
};

export const restoreTransactionSourceSelection = (
  editor: Editor,
  viewChanged: boolean
) => {
  const context = getTransactionSpecContext(editor);
  if (!context) {
    throw new Error('A view selection requires an active transaction.');
  }
  const { snapshot } = context;
  const before = getChangeValue(snapshot.roots) as EditorDocumentValue;
  const after = snapshot.builder.value as EditorDocumentValue;
  context.selection = mapSelectionThroughChange(
    editor,
    snapshot.selection,
    snapshot.activeChange.change,
    before,
    after,
    snapshot.selectionRoot
  );
  context.selectionRoot = snapshot.selectionRoot;
  if (viewChanged) {
    snapshot.viewChanged = true;
    markTransactionChanged(editor);
  }
  syncImplicitTargetToCurrentSelection(editor);
};

export const setTransactionPublicationChange = (
  editor: Editor,
  change: DocumentChange
) => {
  const context = getTransactionSpecContext(editor);
  const snapshot = context?.snapshot;
  if (!context || !snapshot?.publicationBase) {
    throw new Error('Missing authored transaction projection.');
  }
  for (const restore of snapshot.runtimeIndexRollbacks.values()) restore();
  snapshot.runtimeIndexRollbacks.clear();
  Object.assign(snapshot, snapshot.publicationBase);
  snapshot.publicationBase = undefined;
  snapshot.rootIndexes = {};
  snapshot.discardedNodeKeys.clear();
  snapshot.builder = createEditorDocumentChangeBuilder(
    editor,
    getChangeValue(snapshot.roots)
  );
  snapshot.activeChange = { change: snapshot.builder.change };
  context.selection = snapshot.selection;
  context.selectionRoot = snapshot.selectionRoot;
  if (!change.empty) {
    applyTransactionSpecDocumentChangeStep(
      editor,
      snapshot.builder.apply(change),
      {
        notifyTransactionListeners: false,
      }
    );
    const constructed = snapshot.builder.finalize();
    if (constructed) {
      applyTransactionSpecDocumentChangeStep(editor, constructed, {
        notifyTransactionListeners: false,
        selectionMapping: 'representation',
      });
    }
  }
  context.exitAnchorScope();
  context.exitAnchorScope = enterAnchorScope(
    editor,
    getEditorDocumentValue(editor)
  );
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

const withPluginPublicationRollback = <T>(
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

const assertSynchronousTransactionAuthorResult = (result: unknown) => {
  if (
    result !== null &&
    (typeof result === 'object' || typeof result === 'function') &&
    typeof (result as { then?: unknown }).then === 'function'
  ) {
    throw new Error('Transaction authors must be synchronous');
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
  if (PREPARING_COMMIT.has(getEditorRuntimeOwner(editor))) {
    throw new Error('Cannot reenter a finalized editor transaction.');
  }
  const depth = getEditorTransactionDepth(editor);

  if (depth > 0) {
    incrementEditorTransactionDepth(editor, depth);

    try {
      assertSynchronousTransactionAuthorResult(fn(getTransactionView(editor)));
    } finally {
      decrementEditorTransactionDepth(editor);
    }

    return null;
  }

  let pluginPublication:
    | ReturnType<InternalEditorRuntime['preparePluginPublication']>
    | undefined;
  let pluginSchemaIdentity: EditorSchemaIdentity | undefined;
  let committed: EditorCommit | null = null;
  let transactionFailed = false;
  let authoredTransaction: NativeAuthoredTransaction | undefined;
  let transactionError: Readonly<{ value: unknown }> | null = null;

  assertCanStartEditorWrite(editor, options.authority);
  const transactionStartedAt =
    globalThis.performance?.now?.() ?? Date.now();
  const draftContext = createEditorUpdateDraftContext(editor);
  incrementEditorTransactionDepth(editor, depth);

  try {
    authoredTransaction = beginAuthoredTransaction(editor);
    const transaction = getTransactionView(editor);
    const result = profileCoreDuration('transaction-callback', () =>
      fn(transaction)
    );

    assertSynchronousTransactionAuthorResult(result);

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
      getPluginRegistry(editor).corrections.size > 0
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

        const correct = () => {
          profileCoreDuration('transaction-correct', () =>
            correctDocument(editor, {
              force: false,
              root,
            })
          );
        };

        withEditorUpdateRoot(editor, root, () => {
          withEditorUpdateRootChildren(editor, root, correct);
        });
      }
    }

    reconcileExclusiveElementOwnedRoots(editor);
    finalizeTransactionRepresentation(editor);
    if (reconcileExclusiveElementOwnedRoots(editor)) {
      finalizeTransactionRepresentation(editor);
    }

    if (snapshot?.pluginReconfigurations.size) {
      const stagedReconfigurations = [
        ...snapshot.pluginReconfigurations.values(),
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
        ({ editor: pluginEditor, input }) =>
          (Array.isArray(input) ? input : [input]).map((plugin) =>
            Object.freeze({
              editor: pluginEditor,
              plugin,
            })
          )
      ) satisfies readonly InternalPluginPublicationEntry[];

      pluginPublication = getEditorRuntime(editor).preparePluginPublication(
        entries,
        migrations[0] ? { migrate: migrations[0] } : {}
      );

      if (!pluginPublication.configurationChanged) {
        pluginPublication.rollback();
        pluginPublication = undefined;
        snapshot.pluginReconfigurations.clear();
        snapshot.dirtyStateKeys.delete('$configuration');
      } else {
        pluginSchemaIdentity = pluginPublication.schemaContract().identity;
        pluginPublication.stage();
      }

      if (pluginPublication && !pluginPublication.documentChange.empty) {
        withPluginPublicationRollback(pluginPublication, () => {
          pluginPublication?.commit();
          rebindTransactionBuilderToCurrentSchema(editor, snapshot);
        });
        applyTransactionSpecDocumentChangeStep(
          editor,
          snapshot.builder.apply(pluginPublication.documentChange),
          { notifyTransactionListeners: false }
        );
        reconcileExclusiveElementOwnedRoots(editor);
        finalizeTransactionRepresentation(editor);
        if (reconcileExclusiveElementOwnedRoots(editor)) {
          finalizeTransactionRepresentation(editor);
        }
      }

      pluginPublication?.validateDocument(getEditorDocumentValue(editor));
    }
    if (snapshot) {
      if (
        !authoredTransaction &&
        getDocumentState(editor)?.authored !== undefined &&
        !snapshot.activeChange.change.empty
      ) {
        throw new Error(
          'Install authored changes before editing a document with authored data.'
        );
      }
      authoredTransaction?.finish({
        // Authored publication resets the draft before inheriting projection keys.
        discardedNodeKeys: new Set(snapshot.discardedNodeKeys),
        after: snapshot.builder.value as EditorDocumentValue,
        before: getChangeValue(snapshot.roots) as EditorDocumentValue,
        change: snapshot.activeChange.change,
        steps: snapshot.builder.steps,
        selectionWritten:
          getTransactionSpecContext(editor)?.selectionWritten ?? false,
        tx: getActiveUpdateView(editor),
      });
    }
  } catch (error) {
    transactionFailed = true;
    pluginPublication?.rollback();
    pluginPublication = undefined;
    transactionError = { value: error };
  }

  decrementEditorTransactionDepth(editor);
  try {
    if (draftContext) {
      const snapshot = requireCommittedTransactionSnapshot(
        draftContext.snapshot
      );

      if (transactionFailed) {
        clearStagedAnchorHistory(editor);
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
          clearStagedAnchorHistory(editor);
          pluginPublication?.rollback();
          for (const restore of snapshot.runtimeIndexRollbacks.values()) {
            restore();
          }
          disposeTransactionSpecContext(editor, draftContext);
        } else {
          let prepared;
          let anchorPublication;
          PREPARING_COMMIT.add(getEditorRuntimeOwner(editor));
          incrementEditorTransactionDepth(editor, depth);
          try {
            const draftValue = snapshot.builder.value as EditorDocumentValue;
            const draftRoots = {
              [MAIN_ROOT_KEY]: draftValue.children,
              ...draftValue.roots,
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

            const { previousSnapshot } = snapshot;
            const beforeSnapshot =
              snapshot.childrenRoot === MAIN_ROOT_KEY
                ? previousSnapshot
                : getTransactionRootSnapshot(editor, snapshot, MAIN_ROOT_KEY);
            const mainRootChanged =
              !!getInternalDocumentRootChange(
                canonicalChanges,
                MAIN_ROOT_KEY
              ) ||
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
                      snapshot.rootIndexes[MAIN_ROOT_KEY],
                      snapshot.previousVersion + 1
                    )
                  : getSelectionOnlySnapshot(
                      editor,
                      beforeSnapshot,
                      snapshot.previousVersion + 1
                    )
            );

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
                  beforeIndexAt: (root) =>
                    root === MAIN_ROOT_KEY
                      ? beforeSnapshot.index
                      : (snapshot.baseRuntimeIndexes[root]?.() ??
                        snapshot.baseSnapshots[root]?.index),
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
                  startedAt: transactionStartedAt,
                  version: snapshot.previousVersion + 1,
                }
              )
            );

            authoredTransaction?.prepare?.(change);
            anchorPublication = prepareAnchorPublication(editor, change, () => {
              profileCoreDuration('transaction-publish-anchors', () => {
                beginAnchorTransaction(editor);
                if (!canonicalChanges.empty) {
                  notifyAnchorChanges(
                    editor,
                    canonicalChanges,
                    canonicalIndexes,
                    {
                      commit: change,
                      replace: snapshot.reason === 'replace',
                    }
                  );
                }
                commitAnchorTransaction(editor, undefined, change);
              });
            });
            const transactionGuards = [
              ...(TRANSACTION_GUARDS.get(getEditorRuntimeOwner(editor)) ?? []),
            ];
            const publications = runEditorTransactionGuards(
              transactionGuards,
              beforeValue,
              afterValue,
              canonicalChanges,
              snapshot.effects,
              change,
              pluginSchemaIdentity ?? getEditorSchema(editor).identity()
            );
            withPluginPublicationRollback(pluginPublication, () =>
              pluginPublication?.commit()
            );
            if (pluginPublication) {
              anchorPublication.initialize(
                afterValue,
                pluginPublication.beforePublish
              );
            }
            prepared = {
              draftRoots,
              beforeValue,
              afterValue,
              canonicalChanges,
              canonicalIndexes,
              beforeSnapshot,
              afterSnapshot,
              change,
              publications,
            };
          } catch (error) {
            transactionFailed = true;
            anchorPublication?.rollback();
            PREPARING_COMMIT.delete(getEditorRuntimeOwner(editor));
            clearStagedAnchorHistory(editor);
            decrementEditorTransactionDepth(editor);
            pluginPublication?.rollback();
            pluginPublication = undefined;
            for (const restore of snapshot.runtimeIndexRollbacks.values()) {
              restore();
            }
            disposeTransactionSpecContext(editor, draftContext);
            throw error;
          }
          PREPARING_COMMIT.delete(getEditorRuntimeOwner(editor));
          decrementEditorTransactionDepth(editor);
          const {
            draftRoots,
            beforeValue,
            afterValue,
            afterSnapshot,
            change,
            publications,
          } = prepared;
          disposeTransactionSpecContext(editor, draftContext);

          withPluginPublicationRollback(pluginPublication, () => {
            profileCoreDuration('transaction-publish-draft', () =>
              publishTransactionDraft(editor, draftContext, draftRoots)
            );
          });
          profileCoreDuration('set-version', () => {
            setVersion(editor, snapshot.previousVersion + 1);
          });

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

          committed = change;
          authoredTransaction?.publish?.(change);
          anchorPublication?.publish();
          for (const publishPrepared of publications) publishPrepared();
          pluginPublication?.finalize();
          if (pluginPublication) {
            for (const staged of snapshot.pluginReconfigurations.values()) {
              staged.onPublished?.(pluginPublication.cleanup);
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

          anchorPublication?.notify();

          let notificationError: Readonly<{ value: unknown }> | null = null;
          try {
            if (hasPluginChangeListeners(editor)) {
              profileCoreDuration('notify-plugin-change-listeners', () => {
                notifyEditorChangeListeners(
                  editor,
                  change,
                  beforeValue,
                  afterValue
                );
              });
            }
            profileCoreDuration('notify-listeners', () => {
              notifyListeners(editor, change);
            });
            profileCoreDuration('run-after-commit-handlers', () => {
              runAfterCommitHandlers(afterCommitHandlers);
            });
            profileCoreDuration('transaction-flush-post-commit', () => {
              flushPostCommitNotificationQueue(editor);
            });
          } catch (error) {
            notificationError = { value: error };
          }
          pluginPublication?.afterPublish();
          if (notificationError) {
            throw notificationError.value;
          }
        }
      }
    }
  } catch (error) {
    transactionError = { value: error };
  }

  authoredTransaction?.close(committed, transactionFailed);
  if (transactionError) {
    throw transactionError.value;
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
      apply: (step, mappedSelection) => {
        applyDocumentChangeStep(
          editor,
          step,
          mappedSelection
            ? { selectionAfter: mappedSelection, selectionRoot: root }
            : {}
        );
      },
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
            roots: { ...current.roots, [root]: input.content },
          };

    const schema: InternalEditorSchemaApi = getEditorSchema(editor);

    schema.assertDocument(candidate);
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
        input.content
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

const readExactDataRecord = (
  value: unknown,
  label: string,
  allowedKeys: readonly string[],
  requiredKeys: readonly string[] = []
) => {
  if (
    typeof value !== 'object' ||
    value === null ||
    Array.isArray(value) ||
    !isReadMethodRecord(value)
  ) {
    throw new TypeError(`${label} must be a plain data object.`);
  }
  const allowed = new Set(allowedKeys);
  const record = Object.create(null) as Record<string, unknown>;

  for (const key of Reflect.ownKeys(value)) {
    if (typeof key !== 'string' || !allowed.has(key)) {
      throw new TypeError(`${label} field "${String(key)}" is not supported.`);
    }
    const descriptor = getDefined(Object.getOwnPropertyDescriptor(value, key));

    if (!('value' in descriptor)) {
      throw new TypeError(`${label} field "${key}" must be a data property.`);
    }
    if (!descriptor.enumerable) {
      throw new TypeError(`${label} field "${key}" must be enumerable.`);
    }
    record[key] = descriptor.value;
  }
  for (const key of requiredKeys) {
    if (!Object.hasOwn(record, key)) {
      throw new TypeError(`${label} field "${key}" is required.`);
    }
  }

  return record;
};

type DirectSnapshotInput = Exclude<SnapshotInput, PersistedDocumentInput>;

export const isPersistedDocumentEnvelope = (
  input: unknown
): input is PersistedDocumentInput =>
  typeof input === 'object' &&
  input !== null &&
  !Array.isArray(input) &&
  Object.hasOwn(input, 'document') &&
  Object.hasOwn(input, 'schema');

export const transformEditorSnapshotInput = (
  editor: Editor,
  input: SnapshotInput
): SnapshotInput =>
  SNAPSHOT_INPUT_TRANSFORMS.get(getEditorRuntimeOwner(editor))?.(input) ??
  input;

const readDirectSnapshotInput = (
  editor: Editor,
  transformedInput: SnapshotInput
): DirectSnapshotInput => {
  if (!isPersistedDocumentEnvelope(transformedInput)) {
    return transformedInput;
  }

  const envelope = readExactDataRecord(
    transformedInput,
    'Persisted document envelope',
    ['document', 'schema', 'selection'],
    ['document', 'schema']
  );
  const schemaValue = envelope.schema;
  const schemaKind =
    schemaValue && typeof schemaValue === 'object'
      ? Object.getOwnPropertyDescriptor(schemaValue, 'kind')?.value
      : undefined;
  const source = readExactDataRecord(
    schemaValue,
    'Persisted document schema',
    schemaKind === 'derived'
      ? ['fingerprint', 'kind']
      : schemaKind === 'named'
        ? ['fingerprint', 'id', 'kind', 'version']
        : [],
    schemaKind === 'derived'
      ? ['fingerprint', 'kind']
      : schemaKind === 'named'
        ? ['fingerprint', 'id', 'kind', 'version']
        : ['kind']
  ) as unknown as EditorSchemaIdentity;

  const current = getEditorSchema(editor).identity();
  const matches =
    source.kind === current.kind &&
    source.fingerprint === current.fingerprint &&
    (source.kind === 'derived' ||
      (current.kind === 'named' &&
        source.id === current.id &&
        source.version === current.version));

  if (!matches) {
    throw new Error(
      `Persisted document schema ${JSON.stringify(
        source
      )} does not match current schema ${JSON.stringify(current)}.`
    );
  }

  const document = readExactDataRecord(
    envelope.document,
    'Persisted document',
    ['children', 'meta', 'roots'],
    ['children']
  );

  return {
    children: document.children,
    ...(document.meta === undefined ? {} : { meta: document.meta }),
    ...(document.roots === undefined ? {} : { roots: document.roots }),
    ...(envelope.selection === undefined
      ? {}
      : { selection: envelope.selection as SnapshotSelectionInput }),
  } as DirectSnapshotInput;
};

const deserializeSnapshotMeta = (
  editor: Editor,
  meta: Readonly<Record<string, unknown>> | undefined
) => {
  const fields = getStateFieldIdentityMap(editor);
  const nextMeta = Object.fromEntries(
    Object.entries(meta ?? {}).map(([key, value]) => {
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

  return nextMeta;
};

export const replaceTransformedSnapshot = (
  editor: Editor,
  transformedInput: SnapshotInput,
  replacedRoot?: RootKey
) => {
  const apply = () => {
    const snapshotInput = readDirectSnapshotInput(editor, transformedInput);
    const transaction = getTransactionSnapshot(editor);
    const explicitSelection =
      snapshotInput.selection &&
      snapshotInput.selection !== 'start' &&
      snapshotInput.selection !== 'end'
        ? snapshotInput.selection
        : null;
    const selectedRoot =
      replacedRoot ??
      (explicitSelection
        ? (SelectionApi.root(explicitSelection) ?? MAIN_ROOT_KEY)
        : MAIN_ROOT_KEY);
    const fitted = getEditorSchema(editor).fitDocument({
      children: snapshotInput.children as Value,
      ...(snapshotInput.meta === undefined ? {} : { meta: snapshotInput.meta }),
      ...(snapshotInput.roots === undefined
        ? {}
        : { roots: snapshotInput.roots as Record<RootKey, Value> }),
    });
    const representationSelection =
      snapshotInput.selection &&
      snapshotInput.selection !== 'start' &&
      snapshotInput.selection !== 'end'
        ? SelectionApi.isNode(snapshotInput.selection)
          ? SelectionApi.nodes(snapshotInput.selection.paths, {
              anchorPath: snapshotInput.selection.anchorPath,
              focusPath: snapshotInput.selection.focusPath,
            })
          : {
              ...snapshotInput.selection,
              anchor: stripLocationRoots(snapshotInput.selection.anchor),
              focus: stripLocationRoots(snapshotInput.selection.focus),
            }
        : null;
    const selectedInputChildren =
      selectedRoot === MAIN_ROOT_KEY
        ? snapshotInput.children
        : snapshotInput.roots?.[selectedRoot];
    const protectedInlineSpacerPaths =
      representationSelection && RangeApi.isRange(representationSelection)
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
      ...fitted.roots,
    };
    const currentRoots = getEditorDocumentRoots(editor);

    for (const root of Object.keys(fittedRoots).sort((left, right) =>
      left === MAIN_ROOT_KEY
        ? -1
        : right === MAIN_ROOT_KEY
          ? 1
          : left.localeCompare(right)
    )) {
      if (replacedRoot !== undefined && root !== replacedRoot) continue;
      const selectedSource =
        root === selectedRoot && selectedInputChildren
          ? selectedInputChildren
          : fittedRoots[root];

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
        replacedRoot === undefined &&
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

    if (replacedRoot === undefined) {
      const nextMeta = deserializeSnapshotMeta(editor, fitted.meta);

      const previousMeta = getDocumentState(editor) ?? {};

      for (const key of new Set([
        ...Object.keys(previousMeta),
        ...Object.keys(nextMeta),
      ])) {
        setStateValueByKey(editor, key, nextMeta[key]);
      }

      getActiveUpdateView(editor).annotations.set(documentReplacement, true);
    }
    if (transaction) transaction.reason = 'replace';

    const mappedInputSelection = representationSelection
      ? getCurrentSelection(editor)
      : snapshotInput.selection;

    withEditorUpdateRootScope(editor, selectedRoot, () => {
      setCurrentSelection(
        editor,
        resolveSnapshotSelection(editor, mappedInputSelection),
        selectedRoot
      );
    });
  };
  runEditorTransaction(
    editor,
    () =>
      replacedRoot === undefined
        ? withAuthoredDocumentReplacement(editor, apply)
        : apply(),
    {
      authority: 'replace',
    }
  );
};

export const replaceSnapshot = (editor: Editor, input: SnapshotInput) => {
  replaceTransformedSnapshot(
    editor,
    transformEditorSnapshotInput(editor, input)
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

  if (SelectionApi.isNode(selection)) {
    return selection.paths.every((path) => NodeApi.has(editor, path))
      ? SelectionApi.nodes(selection.paths, {
          anchorPath: selection.anchorPath,
          focusPath: selection.focusPath,
        })
      : null;
  }

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
  } catch {
    // Fall through to the next compatible selection reader.
  }

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
  } catch {
    // Fall through to the root-edge reader.
  }

  try {
    return readPointEdge(editor, [], 'start') ?? null;
  } catch {
    // Invalid or detached selections have no readable edge.
  }

  return null;
};

/** Adopt one transformed initial snapshot without live mutation authority. */
export const initializeEditorSchemaSnapshot = (
  editor: Editor,
  transformedInput: SnapshotInput
) => {
  const snapshotInput = readDirectSnapshotInput(editor, transformedInput);
  const explicitSelection =
    snapshotInput.selection &&
    snapshotInput.selection !== 'start' &&
    snapshotInput.selection !== 'end'
      ? snapshotInput.selection
      : null;
  const selectedRoot = explicitSelection
    ? (SelectionApi.root(explicitSelection) ?? MAIN_ROOT_KEY)
    : MAIN_ROOT_KEY;
  const representationSelection =
    snapshotInput.selection &&
    snapshotInput.selection !== 'start' &&
    snapshotInput.selection !== 'end'
      ? SelectionApi.isNode(snapshotInput.selection)
        ? SelectionApi.nodes(snapshotInput.selection.paths, {
            anchorPath: snapshotInput.selection.anchorPath,
            focusPath: snapshotInput.selection.focusPath,
          })
        : {
            ...snapshotInput.selection,
            anchor: stripLocationRoots(snapshotInput.selection.anchor),
            focus: stripLocationRoots(snapshotInput.selection.focus),
          }
      : null;
  const inputDocument = {
    children: snapshotInput.children as Value,
    ...(snapshotInput.meta === undefined ? {} : { meta: snapshotInput.meta }),
    ...(snapshotInput.roots === undefined
      ? {}
      : { roots: snapshotInput.roots as Record<RootKey, Value> }),
  };
  const fitted = representationSelection
    ? getEditorSchema(editor).fitDocumentWithSelection(inputDocument, {
        root: selectedRoot,
        selection: representationSelection,
      })
    : {
        document: getEditorSchema(editor).fitDocument(inputDocument),
        selection: undefined,
      };
  const meta = deserializeSnapshotMeta(editor, fitted.document.meta);
  const document = {
    children: fitted.document.children,
    ...(Object.keys(meta).length === 0 ? {} : { meta }),
    ...(fitted.document.roots === undefined
      ? {}
      : { roots: fitted.document.roots }),
  };

  initializeEditorSchemaDocument(editor, document);
  const selectionInput = representationSelection
    ? fitted.selection
    : snapshotInput.selection;
  const resolvedSelection = withEditorUpdateRootScope(
    editor,
    selectedRoot,
    () => resolveSnapshotSelection(editor, selectionInput)
  );

  initializeEditorSchemaSelection(editor, resolvedSelection, selectedRoot);
};

const CORE_STATE_VIEWS = new WeakMap<object, EditorCoreStateView<any>>();

/**
 * Remove transaction and plugin groups from a public state view.
 *
 * @internal
 */
export const toEditorCoreStateView = <V extends Value>(
  state: EditorCoreStateView<V>
): EditorCoreStateView<V> => {
  const cached = CORE_STATE_VIEWS.get(state);

  if (cached) return cached as EditorCoreStateView<V>;

  const core = Object.freeze({
    children: state.children,
    fragment: state.fragment,
    getField: state.getField,
    key: state.key,
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
  TPlugins extends readonly unknown[] = readonly [],
>(
  editor: Editor<V, TPlugins>,
  options: CreateEditorOptions<V, TPlugins> = {}
) => {
  const initialValue = normalizeEditorValue(options.initialValue);
  const initialChildren = initialValue.children;
  const initialRoots = initialValue.roots;

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
  setEditorMaxLength(editor, options.maxLength);
  EDITOR_READ_ONLY.set(editor, options.readOnly ?? false);
  for (const children of Object.values(initialRoots)) {
    seedNodeKeys(children, editor);
  }
  const initialSelectionRoot = options.initialSelection
    ? (SelectionApi.root(options.initialSelection) ?? MAIN_ROOT_KEY)
    : MAIN_ROOT_KEY;
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

  getEditorSchema(editor).adoptDocumentBaseline(document);

  const roots = {
    [MAIN_ROOT_KEY]: document.children,
    ...document.roots,
  } as Record<string, readonly Descendant[]>;

  CHILDREN.set(editor, roots[MAIN_ROOT_KEY]);
  ROOTS.set(editor, roots);
  CURRENT_CHILDREN_ROOT.set(editor, MAIN_ROOT_KEY);
  if (document.meta === undefined) DOCUMENT_STATE.delete(editor);
  else DOCUMENT_STATE.set(editor, document.meta);
  for (const children of Object.values(roots)) seedNodeKeys(children, editor);
  clearSnapshotCache(editor);
};
