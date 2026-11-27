import {
  definePlugin,
  defineUpdateAnnotation,
  DocumentChange,
  type Editor,
  type EditorCommit,
  type EditorDocumentValue,
  type EditorEffect,
  type EditorEffectHistoryReplayResult,
  type EditorEffectType,
  type EditorSchemaIdentity,
  type Plugin,
  type PluginTypeProvider,
  type RootKey,
  type EditorUpdateTransaction,
  type HistoryApi,
  type HistoryOutcome,
  type HistoryResult,
  type HistorySettlement,
  type Selection,
  SelectionApi,
  type TextSelection,
  type TxDeclaredMethod,
  txLocate,
  txOnly,
  type TxOnlyMethod,
  type Value,
  invertEffect,
} from '..';
import {
  consumeAnchorHistoryCapture,
  mapAnchorHistoryRecovery,
  mergeAnchorHistoryRecovery,
  stageAnchorHistoryRecovery,
} from '../core/anchor-state';
import { getAuthoredUpdateView } from '../core/authored-runtime';
import {
  type CarriedRun,
  carriesRun,
  invertCarriedRun,
} from '../core/change/carried-run';
import {
  collapseDocumentElementPropertyWrites,
  createInternalDocumentChange,
  getInternalDocumentChangeRecords,
  getInternalDocumentChangeRootKeys,
  getInternalDocumentRootChange,
  isInternalDocumentChangeNoop,
  valueRootIndex,
  withoutRetainedRecordSets,
} from '../core/change/document-change';
import { copyRoot } from '../core/change/lazy-root';
import {
  type ChangeFacts,
  composeFacts,
  flipFacts,
  UNKNOWN_FACTS,
} from '../core/change/record';
import {
  getEditorCommitAdmission,
  getEditorCommitCarriedRuns,
  getEditorCommitFacts,
  getEditorCommitRest,
  getEditorCommitStartedAt,
  getEditorCommitUnsettle,
  historyReplayClaim,
} from '../core/commit';
import { DOCUMENT_SETTLED_TAG } from '../core/document-admission';
import { setActiveHistoryReplayOrigin } from '../core/document-recorder';
import {
  getEditorRuntime,
  getEditorRuntimeOwner,
} from '../core/editor-runtime';
import { reportEditorLifecycleError } from '../core/lifecycle-error';
import {
  type NativeGroupingInput,
  nativeGroupingInput,
} from '../core/native-grouping-input';
import { getCompiledEditorSchema } from '../core/plugin-registry';
import { MAIN_ROOT_KEY } from '../core/public-root';
import {
  applyDocumentChange,
  documentReplacement,
  getCurrentSelectionRoot,
  getEditorDocumentValue,
  getEditorUpdateRoot,
  isBuildingTransactionSpec,
  isInTransaction,
  type EditorHistoryEntry,
  type EditorHistoryHeadRoots,
  type EditorHistoryRecordOptions,
  type EditorHistoryRecordResult,
  type EditorHistoryReplayReceipt,
  type EditorHistoryStep,
  recordEditorHistoryReplayReceipt,
  registerEditorHistoryRuntime,
  registerEditorTransactionGuard,
  setTypedMarks,
} from '../core/public-state';
import { getRecordText, getValueRecords } from '../core/record-store';
import {
  EditorNoncanonicalChangeError,
  EditorSchemaValidationError,
} from '../core/schema-validation';
import { createEditorEffect } from '../core/transaction-values';
import {
  HISTORY_BOUNDARY_TAG,
  type InternalEditorUpdateOptions,
  type SpeculativeUpdate,
} from '../core/update-policy';
import { consumeCommitCarets, restoreHistoryCarets } from '../core/view-carets';
import { countCoreWork } from '../core/work';
import { getSelection } from '../interfaces/editor';
import { type Batch, History, type HistoryJSON } from './history';
import {
  historyCaretViews,
  keyedHistoryCarets,
  mergeHistoryCarets,
} from './history-carets';
import { decodeHistoryValue, encodeHistoryValue } from './history-codec';
import {
  dropFrozenRedos,
  endFirstWrite,
  type FirstWrite,
  type FirstWriteOutcome,
  firstWriteChanges,
  firstWriteOf,
  resolveFrozenRedo,
  isRedoFrozen,
  joinRedoFreeze,
  observeFirstWrite,
  readHistory,
  releaseFirstWrite,
  settleFirstWrite,
  startFirstWrite,
} from './history-first-write';
import {
  createHistoryBatchGroup,
  type HistoryBatchGroup,
  isSameHistoryPath,
  mergeHistoryBatchGroups,
  shouldMergeBatch,
  shouldMergeCompositionBatch,
  shouldMergeExplicitBatch,
} from './history-merge-policy';
import {
  checkedCarryProgram,
  historyReplaySchemaOf,
  invertedCarryProgram,
  mapHistorySelection,
} from './history-replay';
import {
  cloneSelection,
  readHistoricSelection,
  restoreHistoricSelection,
  shouldPreserveHistoricDOMSelection,
  shouldRestoreHistoricSelection,
} from './history-selection';
import {
  beginHistoryReplay,
  captureHistoryState,
  clearHistoryState,
  completeHistoryAction,
  configureHistoryState,
  crossingDropCount,
  dropHistoryHead,
  attachKeptHistoryRedo,
  dropPendingHistoryReplayEntry,
  forgetHistoryStep,
  historyFactsOf,
  historyProgramOf,
  historyStepId,
  knownHistoryStepId,
  markPendingHistoryReplayEdited,
  peekHistoryEntry,
  peekHistoryReplayEntry,
  peekJoinableUndoEntry,
  takeDroppedHistoryCauses,
  queuePendingHistoryReplayMapping,
  queueHistoryMapping,
  readPendingHistoryReplay,
  replaceHistoryHead,
  replaceHistoryState,
  replaceUndoStep,
  restoreHistoryState,
  settlePendingHistoryReplay,
  withHistoryStateDraft,
  withPublishedHistoryState,
  withHistoryFacts,
  withHistoryProgram,
  writeHistory,
} from './history-state';

const HEAD_ROOTS = new WeakMap<object, readonly RootKey[]>();

const readHeadRoots = <V extends Value>(
  editor: Editor<V>,
  direction: HistoryAction
): EditorHistoryHeadRoots =>
  withPublishedHistoryState(editor, () => {
    let entry: ReturnType<typeof peekHistoryEntry>;

    if (direction === 'redo' && isRedoFrozen(editor)) return null;
    try {
      entry = peekHistoryEntry(
        editor,
        direction === 'undo' ? 'undos' : 'redos'
      );
    } catch {
      return 'broken';
    }
    if (!entry) return null;

    const known = HEAD_ROOTS.get(entry.batch);

    if (known) return known;
    countCoreWork('historyHeadRootReads');
    const { change } = entry.batch;
    const roots = Object.freeze(
      [
        ...new Set([
          ...getInternalDocumentChangeRootKeys(change),
          ...change.deleteRoots,
        ]),
      ].filter((root) => !change.createRoots.has(root))
    );

    HEAD_ROOTS.set(entry.batch, roots);

    return roots;
  });

const failInvariant = (message: string): never => {
  throw new Error(message);
};

export type HistoryStateApi<V extends Value = Value> = (() => History<V>) & {
  /** Return whether the redo branch has a surviving mapped batch. */
  hasRedo: () => boolean;
  /** Return whether the undo branch has a surviving mapped batch. */
  hasUndo: () => boolean;
  /** Return the replay currently waiting for its session owner. */
  pending: () => HistoryAction | null;
};

export type HistoryControlTx = TxOnlyMethod<() => void>;

export type HistoryTxApi<V extends Value = Value> = {
  /**
   * Merge this transaction into the previous compatible undo batch. Two
   * batches whose commits change no root, such as ones that write only
   * records, are compatible.
   */
  merge: HistoryControlTx;
  /** Make this transaction start a fresh undo batch. */
  newBatch: HistoryControlTx;
  /** Replace both history branches when the surrounding transaction commits. */
  restore: TxDeclaredMethod<(history: History<V>) => void>;
  /** Do not save this transaction to history. */
  skip: HistoryControlTx;
};

export type HistoryOptions<TEnabled extends boolean | undefined = undefined> = {
  /** Disable history for an editor that installs history through a preset. */
  enabled?: TEnabled;
  /** Maximum number of undo and redo batches retained per branch. */
  maxDepth?: number;
  /** Idle time in milliseconds before an automatic edit starts a new batch. */
  newBatchDelay?: number;
};

export type HistoryPluginTypes<V extends Value = Value> = {
  api: {
    history: HistoryApi;
  };
  read: {
    history: HistoryStateApi<V>;
  };
  update: {
    history: HistoryTxApi<V>;
  };
};

type HistoryPluginDefinition<TEnabled extends boolean | undefined> = {
  activate: true;
  api: HistoryApi;
  enabled: TEnabled;
  name: 'history';
  on: true;
  read: HistoryStateApi;
  update: HistoryTxApi;
  validate: true;
};

/** Value-sensitive history capability provider for plugin composition. */
export type HistoryPluginTypeProvider =
  PluginTypeProvider<HistoryPluginTypeProvider.Contract>;

// declaration merging keeps the HKT contract nameable through package declarations without exporting a second root symbol.
export declare namespace HistoryPluginTypeProvider {
  interface Contract {
    readonly input: Value;
    readonly output: HistoryPluginTypes<this['input']>;
  }
}

export type HistoryPlugin<TEnabled extends boolean | undefined = undefined> =
  Plugin<HistoryPluginDefinition<TEnabled>> & HistoryPluginTypeProvider;

type HistoryMode = 'merge' | 'push' | 'skip';
type HistoryAction = 'redo' | 'undo';

const HISTORY_ACTIVATION = new WeakMap<Editor, object>();
const LAST_AUTOMATIC_HISTORY_GROUP_TIME = new WeakMap<Editor, number>();
const PENDING_HISTORY_SCHEMA_ACTIVATION = new WeakMap<Editor, object>();
const COMMIT_STEPS = new WeakMap<
  EditorCommit,
  Readonly<{ how: EditorHistoryStep['how']; identity: object }>
>();
// Keys every saved commit. COMMIT_STEPS keys a merge only into a step sync
// already knows, because any other merge there would mint an id sync never reads.
const COMMIT_ENTRIES = new WeakMap<EditorCommit, EditorHistoryEntry>();
const commitStepWith = (
  commit: EditorCommit,
  idOf: (identity: object) => string | undefined
) => {
  const step = COMMIT_STEPS.get(commit);
  const id = step && idOf(step.identity);

  return step && id ? { how: step.how, id } : null;
};

const getHistoryMaxDepth = (options: Pick<HistoryOptions, 'maxDepth'>) => {
  const maxDepth = options.maxDepth ?? 100;

  if (!Number.isInteger(maxDepth) || maxDepth < 1) {
    throw new Error('history maxDepth must be a positive integer.');
  }

  return maxDepth;
};

const getHistoryNewBatchDelay = (
  options: Pick<HistoryOptions, 'newBatchDelay'>
) => {
  const newBatchDelay = options.newBatchDelay ?? 500;

  if (!Number.isFinite(newBatchDelay) || newBatchDelay < 0) {
    throw new Error('history newBatchDelay must be a non-negative number.');
  }

  return newBatchDelay;
};

const historyAction = defineUpdateAnnotation<HistoryAction>({
  combine: (_previous, next) => next,
  key: 'history.action',
});

const historyReplayDrop = defineUpdateAnnotation<HistoryAction>({
  combine: (_previous, next) => next,
  key: 'history.replay-drop',
});

const reportFailedHistoryReplay = <V extends Value>(
  editor: Editor<V>,
  direction: HistoryAction,
  cause: unknown
) => {
  reportEditorLifecycleError({
    cause,
    direction,
    editor,
    phase: 'replay',
    source: 'history',
  });
};

const dropHistoryHeadStep = <V extends Value>(
  editor: Editor<V>,
  direction: HistoryAction,
  options: InternalEditorUpdateOptions = {}
) => {
  getEditorRuntime(editor).update((tx) => {
    tx.tags.add('history-skip');
    tx.annotations.set(historyReplayDrop, direction);
  }, options);
};

const keptHistoryChange = <V extends Value>(
  editor: Editor<V>,
  change: DocumentChange
) =>
  withoutRetainedRecordSets(change, getCompiledEditorSchema(editor).recordSets);

const dropFailedHistoryHead = <V extends Value>(
  editor: Editor<V>,
  direction: HistoryAction,
  cause: unknown
) => {
  countCoreWork('carriedFallbacks');
  try {
    dropHistoryHeadStep(editor, direction);
  } finally {
    reportFailedHistoryReplay(editor, direction, cause);
  }
};

const historyReplayRequest = defineUpdateAnnotation<number>({
  combine: (_previous, next) => next,
  key: 'history.replay-request',
});

type HistoryReplayClaim = Readonly<{
  activation: object;
  direction: HistoryAction;
  identity: object;
  request: number;
  undoAnchor: object | null;
}>;

type HistoryReplaySettlement = Readonly<{
  request: number;
  status: 'applied' | 'blocked';
}>;

const historyReplaySettlement = defineUpdateAnnotation<HistoryReplaySettlement>(
  {
    combine: (_previous, next) => next,
    key: 'history.replay-settlement',
  }
);

type HistoryRecordToken = {
  published: boolean;
  readonly write: FirstWrite | null;
};

type FirstWriteSettlement = {
  readonly end: 'confirmed' | 'withdrawn';
  published: boolean;
  readonly undo: Extract<HistorySettlement, { status: 'blocked' }> | null;
  readonly write: FirstWrite;
};

let nextHistoryToken = 1;

/**
 * An annotation that hands a commit's reducer one live token. Annotations
 * clone their values, so the commit carries the token's number.
 */
const defineHistoryToken = <TToken>(key: string) => {
  const annotation = defineUpdateAnnotation<number>({
    combine: (_previous, next) => next,
    key,
  });
  const tokens = new Map<number, TToken>();

  return {
    annotation,
    of: (commit: EditorCommit) => {
      const id = commit.annotations[key];

      return typeof id === 'number' ? tokens.get(id) : undefined;
    },
    with: <T>(token: TToken, fn: (id: number) => T) => {
      const id = nextHistoryToken;

      nextHistoryToken += 1;
      tokens.set(id, token);
      try {
        return fn(id);
      } finally {
        tokens.delete(id);
      }
    },
  };
};

const historyRecord = defineHistoryToken<HistoryRecordToken>('history.record');
const historyFirstWrite = defineHistoryToken<FirstWriteSettlement>(
  'history.first-write'
);

const ON_COMMIT_PUBLISHED = new WeakMap<EditorCommit, () => void>();

type PreparedHistoryReplay = Readonly<{
  receipt: EditorHistoryReplayReceipt;
  request: number;
}>;

const PREPARED_HISTORY_REPLAYS = new Map<number, EditorHistoryReplayReceipt>();
const PENDING_HISTORY_REPLAY_CLAIMS = new Map<number, HistoryReplayClaim>();
let nextHistoryReplayRequest = 1;
const EMPTY_HISTORY_RESULT = Object.freeze({
  status: 'empty',
}) satisfies HistoryOutcome;
const BUSY_HISTORY_RESULT = Object.freeze({
  status: 'busy',
}) satisfies HistoryOutcome;
const FAILED_HISTORY_RESULT = Object.freeze({
  status: 'failed',
}) satisfies HistorySettlement;
const RECORDED_HISTORY_RESULT = Object.freeze({
  status: 'recorded',
}) satisfies EditorHistoryRecordResult;

const reportFirstWrite = (editor: Editor, cause: unknown) => {
  reportEditorLifecycleError({
    cause,
    editor,
    phase: 'apply',
    source: 'history',
  });
};

const refusalReason = (refusal: unknown) => {
  if (typeof refusal !== 'object' || refusal === null) return 'refused';
  if (
    'reason' in refusal &&
    typeof refusal.reason === 'string' &&
    refusal.reason !== ''
  ) {
    return refusal.reason;
  }
  if (
    'code' in refusal &&
    typeof refusal.code === 'string' &&
    refusal.code !== ''
  ) {
    return refusal.code;
  }
  return 'refused';
};

const blockedOf = <V extends Value>(
  editor: Editor<V>,
  fn: (tx: HistoryTransaction<V>) => void,
  options: InternalEditorUpdateOptions = {}
): HistoryOutcome | null => {
  let blocked: HistoryOutcome | null = null;

  getEditorRuntime(editor).update(fn, {
    ...options,
    onRefusal: (refusal) => {
      blocked = Object.freeze({
        reason: refusalReason(refusal),
        status: 'blocked',
      });
    },
  });
  return blocked;
};

const historyRestore = defineUpdateAnnotation<HistoryJSON>({
  combine: (_previous, next) => next,
  key: 'history.restore',
});

type HistoryTransaction<V extends Value = Value> = Pick<
  EditorUpdateTransaction<V>,
  'annotations' | 'changes' | 'effects' | 'selection' | 'tags'
>;

const createHistoryControl = <V extends Value>(
  tx: HistoryTransaction<V>,
  mode: HistoryMode
): HistoryControlTx =>
  txOnly(() => {
    tx.tags.add(
      mode === 'push'
        ? 'history-push'
        : mode === 'merge'
          ? 'history-merge'
          : 'history-skip'
    );
  });

const isRecordOnlyChange = (change: DocumentChange) =>
  change.createRoots.size === 0 &&
  change.deleteRoots.size === 0 &&
  getInternalDocumentChangeRootKeys(change).length === 0;

const survivingSessionRecordChange = <V extends Value>(
  base: EditorDocumentValue<V>,
  current: EditorDocumentValue<V>,
  outside: DocumentChange | null,
  change: DocumentChange
): DocumentChange => {
  if (change.empty) return DocumentChange.empty;

  const ops = getInternalDocumentChangeRecords(change);

  if (ops.size === 0) return DocumentChange.empty;

  const baseRecords = getValueRecords(base);
  const currentRecords = getValueRecords(current);
  const outsideOps = outside ? getInternalDocumentChangeRecords(outside) : null;
  const kept = new Map<string, Map<string, string | null>>();

  for (const [set, writes] of ops) {
    const outsideSet = outsideOps?.get(set);

    for (const [id, op] of writes) {
      if (outsideSet?.has(id)) continue;
      if (
        getRecordText(baseRecords, set, id) !==
        getRecordText(currentRecords, set, id)
      ) {
        continue;
      }

      let setOps = kept.get(set);

      if (!setOps) {
        setOps = new Map();
        kept.set(set, setOps);
      }
      setOps.set(id, op);
    }
  }

  return kept.size === 0
    ? DocumentChange.empty
    : createInternalDocumentChange(new Map(), {
        records: kept,
      });
};

const runHistoricUpdate = <V extends Value>(
  editor: Editor<V>,
  root: string,
  tx: HistoryTransaction<V>,
  batch: Batch<V>,
  fn: () => void
) => {
  const stateOnly =
    isRecordOnlyChange(batch.change) && batch.effects.length > 0;
  const preserveSelection =
    stateOnly || shouldPreserveHistoricDOMSelection(root, batch);

  tx.tags.add('semantic-command');
  tx.tags.add('history-skip');
  tx.tags.add('historic');

  if (preserveSelection) {
    tx.tags.add('skip-dom-selection');
    tx.tags.add('skip-selection-focus');
    tx.tags.add('skip-scroll-into-view');
  } else {
    tx.tags.add('skip-selection-focus');
  }

  fn();
  setTypedMarks(editor, null);
};

const toChangeValue = <V extends Value>(
  value: EditorDocumentValue<V>
): { children: V; roots?: Record<string, V> } => {
  const changeValue: Record<string, unknown> = value.roots
    ? { roots: value.roots }
    : {};

  copyRoot(changeValue, 'children', value, 'children');

  return changeValue as { children: V; roots?: Record<string, V> };
};

const consumeHistoryBatch = <V extends Value>(
  editor: Editor<V>,
  tx: HistoryTransaction<V>,
  batch: Batch<V>,
  direction: 'redo' | 'undo',
  root: string
) => {
  const target = direction === 'undo' ? 'before' : 'after';
  const caretRoot = getSelection(getEditorRuntimeOwner(editor))
    ? getCurrentSelectionRoot(editor)
    : undefined;
  const facts = historyFactsOf(batch);

  applyDocumentChange(
    getEditorRuntimeOwner(editor),
    keptHistoryChange(editor, batch.change),
    {},
    facts
  );
  if (facts?.kind === 'recorded') countCoreWork('factedReplays');
  for (const effect of batch.effects) {
    tx.effects.emit(effect.type, effect.value);
  }
  if (shouldRestoreHistoricSelection(root, caretRoot, batch, target)) {
    restoreHistoricSelection(editor, tx, batch, root, target);
  }
};

const applyHistoryAction = <V extends Value>(
  editor: Editor<V>,
  tx: HistoryTransaction<V>,
  direction: HistoryAction,
  root: string,
  request: number,
  canonical: boolean
) => {
  const entry = (canonical ? peekHistoryReplayEntry : peekHistoryEntry)(
    editor,
    direction === 'undo' ? 'undos' : 'redos',
    request
  );

  if (!entry) return false;

  stageAnchorHistoryRecovery(
    getEditorRuntimeOwner(editor),
    entry.recovery,
    direction === 'undo' ? 'before' : 'after'
  );

  setActiveHistoryReplayOrigin(editor, entry.origin);
  runHistoricUpdate(editor, root, tx, entry.batch, () => {
    consumeHistoryBatch(editor, tx, entry.batch, direction, root);
    if (entry.carets) {
      restoreHistoryCarets(
        editor,
        historyCaretViews(editor, entry.carets, entry.batch),
        direction === 'undo' ? 'before' : 'after'
      );
    }
  });
  tx.annotations.set(historyAction, direction);
  tx.annotations.set(historyReplayRequest, request);

  return true;
};

const createCollapsedRangeAtTextInsert = (
  group: Extract<HistoryBatchGroup, { kind: 'text' }>,
  offset: number,
  template: Selection
): TextSelection => {
  const afterPoint =
    group.afterPoint ?? failInvariant('Expected value to be defined');
  const point = {
    offset,
    path: [...afterPoint.path],
    ...(group.root === 'main' ? {} : { root: group.root }),
  };

  return SelectionApi.isText(template)
    ? { ...template, anchor: point, focus: point }
    : { anchor: point, focus: point, kind: 'text' };
};

const getTextBurstSelectionBefore = ({
  group,
  isNativeTextInput,
  selectionBefore,
}: {
  group: HistoryBatchGroup | null;
  isNativeTextInput: boolean;
  selectionBefore: Selection;
}): { root: string | undefined; selection: TextSelection } | null => {
  if (
    !isNativeTextInput ||
    group?.kind !== 'text' ||
    group.mode !== 'insert' ||
    !group.afterPoint
  ) {
    return null;
  }

  const insertedLength = group.toAfter - group.fromAfter;
  const insertEnd = group.afterPoint.offset;
  const insertStart = insertEnd - insertedLength;

  if (
    insertedLength <= 1 ||
    insertStart < 0 ||
    group.target.path !== group.afterPoint.path.join('.') ||
    (group.beforePoint !== null &&
      (!isSameHistoryPath(group.beforePoint.path, group.afterPoint.path) ||
        group.beforePoint.offset < insertStart ||
        group.beforePoint.offset > insertEnd))
  ) {
    return null;
  }

  return {
    root: group.root,
    selection: createCollapsedRangeAtTextInsert(
      group,
      insertStart,
      selectionBefore
    ),
  };
};

const canMergeNativeHistory = (
  current: NativeGroupingInput | undefined,
  previous: NativeGroupingInput | undefined,
  withinAutomaticWindow: boolean
) => {
  if (!current && !previous) return withinAutomaticWindow;
  if (!current || !previous || current.origin !== previous.origin) {
    return false;
  }
  if (current.composition !== undefined || previous.composition !== undefined) {
    return (
      current.composition !== undefined &&
      current.composition === previous.composition
    );
  }

  return withinAutomaticWindow;
};

const prepareHistoryBatch = <V extends Value>(
  action: DocumentChange,
  commit: EditorCommit<V>,
  effects: readonly EditorEffect[]
): Readonly<{
  batch: Batch<V>;
  group: HistoryBatchGroup | null;
}> | null => {
  const baseGroup = createHistoryBatchGroup(commit);
  const native = commit.annotations[nativeGroupingInput.key] as
    | NativeGroupingInput
    | undefined;
  const group: HistoryBatchGroup | null = baseGroup
    ? Object.freeze({ ...baseGroup, ...(native ? { native } : {}) })
    : native?.composition === undefined
      ? null
      : Object.freeze({ kind: 'effects', native });
  const resolveSelectionRoot = (
    selection: Selection,
    fallback?: string
  ): string | undefined => {
    if (!selection) return undefined;

    const root = SelectionApi.root(selection) ?? fallback;

    return root === MAIN_ROOT_KEY ? undefined : root;
  };
  let batchSelectionBefore = cloneSelection(commit.selectionBefore);
  let batchSelectionBeforeRoot = resolveSelectionRoot(
    batchSelectionBefore,
    commit.selectionBeforeRoot
  );
  const batchSelectionAfterRoot = resolveSelectionRoot(
    commit.selectionAfter,
    commit.selectionAfterRoot
  );
  const textBurstSelectionBefore = getTextBurstSelectionBefore({
    group,
    isNativeTextInput: commit.tags.includes('native-text-input'),
    selectionBefore: commit.selectionBefore,
  });

  if (textBurstSelectionBefore) {
    batchSelectionBefore = textBurstSelectionBefore.selection;
    batchSelectionBeforeRoot =
      textBurstSelectionBefore.root === MAIN_ROOT_KEY
        ? undefined
        : textBurstSelectionBefore.root;
  }

  if (action.empty && effects.length === 0) {
    return null;
  }

  return Object.freeze({
    batch: {
      change: action,
      effects: effects.toReversed().map(invertEffect),
      selectionAfter: cloneSelection(commit.selectionAfter),
      selectionBefore: batchSelectionBefore,
      ...(batchSelectionAfterRoot !== undefined
        ? { selectionAfterRoot: batchSelectionAfterRoot }
        : {}),
      ...(batchSelectionBeforeRoot !== undefined
        ? { selectionBeforeRoot: batchSelectionBeforeRoot }
        : {}),
    },
    group,
  });
};

/**
 * What the commit settled, as an undo step keeps it: its take-back, and its
 * rest when the commit settled a decision's text, so the step's change is the
 * take-back then the rest.
 */
const settledParts = (
  commit: EditorCommit,
  kept: (change: DocumentChange) => DocumentChange
) => {
  const unsettle = getEditorCommitUnsettle(commit);

  if (!unsettle) return null;

  const rest = getEditorCommitRest(commit);

  return rest
    ? {
        change: kept(unsettle).compose(kept(rest)),
        rest: kept(rest),
        unsettle: kept(unsettle),
      }
    : { unsettle };
};

const carriedBack = (
  runs: readonly CarriedRun[],
  takeBack: DocumentChange,
  after: EditorDocumentValue
) => {
  const carried = runs.flatMap((run) => {
    const inverse = invertCarriedRun(run);
    const change = getInternalDocumentRootChange(takeBack, run.root);
    const base = valueRootIndex(after, run.root);

    return change && carriesRun(change, base, change.apply(base), inverse)
      ? [inverse]
      : [];
  });

  return carried.length > 0 ? { carried } : null;
};

/** The change from the commit's document that takes back its admission. */
const admissionTakeBack = (commit: EditorCommit) => {
  const admitted = getEditorCommitAdmission(commit);

  return admitted
    ? admitted.repair.invert(admitted.base)
    : DocumentChange.empty;
};

const redoWithoutSettlement = (
  editor: Editor,
  inverse: DocumentChange,
  unsettle: DocumentChange,
  undone: EditorDocumentValue
) =>
  collapseDocumentElementPropertyWrites(
    inverse.compose(unsettle, undone),
    undone,
    historyReplaySchemaOf(editor).isSetValued
  );

/**
 * Settle a recorded step by its first write's answer: `blocked` withdraws the
 * step, anything else confirms it, and a rejection or a malformed answer also
 * reports once. A settlement whose commit cannot publish falls back to the
 * base outcome, the step kept and a redo it froze dropped. The settlement runs
 * on the owner, so a view that turns read-only meanwhile does not stop it.
 */
const answerFirstWrite = (
  editor: Editor,
  write: FirstWrite,
  outcome: FirstWriteOutcome
) => {
  if (write.state === 'running' && write.identity) {
    const end = outcome.kind === 'blocked' ? 'withdrawn' : 'confirmed';

    if (firstWriteChanges(editor, write.identity, end)) {
      const settlement: FirstWriteSettlement = {
        end,
        published: false,
        undo:
          outcome.kind === 'blocked'
            ? Object.freeze({ reason: outcome.reason, status: 'blocked' })
            : null,
        write,
      };

      try {
        historyFirstWrite.with(settlement, (id) =>
          getEditorRuntime(getEditorRuntimeOwner(editor)).update(
            (tx) => {
              tx.annotations.set(historyFirstWrite.annotation, id);
            },
            { ignoreGuardRefusals: true }
          )
        );
      } catch (error) {
        reportFirstWrite(editor, error);
      }
      if (!settlement.published) {
        dropFrozenRedos(editor, write.identity);
        endFirstWrite(write, 'confirmed');
      }
    } else {
      endFirstWrite(write, end);
    }
  }
  if (outcome.kind === 'failed') reportFirstWrite(editor, outcome.cause);
};

/**
 * Record one session step in its own update. A first write is observed before
 * anything can throw, and the step counts as recorded once History publishes
 * it, whatever faults after.
 */
const recordHistoryStep = (
  editor: Editor,
  effect: EditorEffectType,
  value: unknown,
  { firstWrite }: EditorHistoryRecordOptions
): EditorHistoryRecordResult => {
  const write = firstWrite
    ? observeFirstWrite(firstWrite, (observed, outcome) =>
        answerFirstWrite(editor, observed, outcome)
      )
    : null;
  const owner = getEditorRuntimeOwner(editor);

  if (isInTransaction(owner) || isBuildingTransactionSpec(owner)) {
    throw new Error(
      'History record cannot run inside editor.update or a transaction spec.'
    );
  }
  if (typeof effect.history !== 'object') {
    throw new Error(
      `History records only session effects; "${effect.key}" has no replay owner.`
    );
  }
  if (editor.read.view.isReadOnly()) {
    return Object.freeze({ reason: 'read-only', status: 'blocked' });
  }

  const token: HistoryRecordToken = { published: false, write };
  let blocked: HistoryOutcome | null;

  try {
    blocked = historyRecord.with(token, (id) =>
      blockedOf(editor, (tx) => {
        tx.effects.emit(effect, value);
        tx.annotations.set(historyRecord.annotation, id);
      })
    );
  } catch (error) {
    if (!token.published) throw error;
    reportFirstWrite(editor, error);
    return RECORDED_HISTORY_RESULT;
  }
  if (token.published) return RECORDED_HISTORY_RESULT;
  if (blocked && 'reason' in blocked) return blocked;
  throw new Error('History did not record the session step.');
};

const shouldSaveCommit = (
  commit: EditorCommit,
  effects: readonly EditorEffect[]
) =>
  !commit.tags.includes('history-skip') &&
  !commit.tags.includes('historic') &&
  !commit.annotations[documentReplacement.key] &&
  (!commit.changes.empty || effects.length > 0);

const createHistoryPlugin = <
  const TEnabled extends boolean | undefined = undefined,
>(
  options: HistoryOptions<TEnabled> = {}
): HistoryPlugin<TEnabled> => {
  const reduceHistory = ({
    after,
    before,
    commit,
    editor,
    schema,
  }: {
    after: EditorDocumentValue;
    before: EditorDocumentValue;
    commit: EditorCommit;
    editor: Editor;
    schema: EditorSchemaIdentity;
  }): PreparedHistoryReplay | undefined => {
    const anchorCapture = consumeAnchorHistoryCapture(commit);
    const commitCarets = consumeCommitCarets(commit);
    const carets = commitCarets
      ? keyedHistoryCarets(commitCarets, before, after)
      : null;

    const schemaChanged = configureHistoryState(
      editor,
      getHistoryMaxDepth(options),
      schema
    );

    if (schemaChanged) dropPendingHistoryReplayEntry(editor);
    if (schemaChanged || PENDING_HISTORY_SCHEMA_ACTIVATION.has(editor)) {
      LAST_AUTOMATIC_HISTORY_GROUP_TIME.delete(editor);
      return undefined;
    }

    const firstWrite = historyFirstWrite.of(commit);

    // A first write's answer can land while the user types, so its commit
    // keeps the typing clock and the typing stays one step.
    if (firstWrite?.write.identity) {
      const endsUndo = settleFirstWrite(
        editor,
        firstWrite.write.identity,
        firstWrite.end
      );

      ON_COMMIT_PUBLISHED.set(commit, () => {
        firstWrite.published = true;
        endFirstWrite(
          firstWrite.write,
          firstWrite.end,
          endsUndo ? firstWrite.undo : null
        );
      });
      return undefined;
    }

    const { recordSets } = getCompiledEditorSchema(editor);
    const kept = (change: DocumentChange) =>
      withoutRetainedRecordSets(change, recordSets);
    const changes = kept(commit.changes);
    const inverse = kept(commit.inverseChanges);
    const facts = getEditorCommitFacts(commit);
    const inverseFacts = (change: DocumentChange) =>
      change === inverse ? flipFacts(facts) : undefined;

    const effects = commit.effects.filter(
      (effect) => effect.type.history !== 'skip'
    );
    const action = commit.annotations[historyAction.key] as
      | HistoryAction
      | undefined;
    const dropped = commit.annotations[historyReplayDrop.key] as
      | HistoryAction
      | undefined;
    const replayRequest = commit.annotations[historyReplayRequest.key] as
      | number
      | undefined;
    const restoredHistoryJSON = commit.annotations[historyRestore.key] as
      | HistoryJSON
      | undefined;
    const replayClaimRequest = commit.annotations[historyReplayClaim.key] as
      | number
      | undefined;
    const replaySettlement = commit.annotations[historyReplaySettlement.key] as
      | HistoryReplaySettlement
      | undefined;

    if (replayClaimRequest !== undefined) {
      const replayClaim = PENDING_HISTORY_REPLAY_CLAIMS.get(replayClaimRequest);
      if (!replayClaim) {
        throw new Error('History replay claim is missing its owning request.');
      }
      beginHistoryReplay(editor, {
        ...replayClaim,
        claimVersion: commit.version,
      });
      LAST_AUTOMATIC_HISTORY_GROUP_TIME.delete(editor);
      return undefined;
    }

    if (replaySettlement) {
      const claim = readPendingHistoryReplay(editor);
      const claimVersion = claim?.claimVersion;
      const identity = settlePendingHistoryReplay(editor, {
        ...(replaySettlement.status === 'applied'
          ? { after, change: inverse, effects, forward: changes }
          : {}),
        request: replaySettlement.request,
        status: replaySettlement.status,
      });

      LAST_AUTOMATIC_HISTORY_GROUP_TIME.delete(editor);
      // An applied undo confirms its step and lets its first write go, even
      // when a mapping removed the step meanwhile, so a redo the step froze
      // clears and a late answer of that write changes nothing.
      if (
        replaySettlement.status === 'applied' &&
        claim?.direction === 'undo'
      ) {
        const step = claim.identity;

        if (!identity) settleFirstWrite(editor, step, 'confirmed');
        ON_COMMIT_PUBLISHED.set(commit, () => releaseFirstWrite(step));
      }
      return identity
        ? Object.freeze({
            receipt: Object.freeze({
              claimVersion,
              group: identity,
              selection: null,
              version: commit.version,
            }),
            request: replaySettlement.request,
          })
        : undefined;
    }

    if (restoredHistoryJSON) {
      dropPendingHistoryReplayEntry(editor);
      replaceHistoryState(
        editor,
        decodeHistoryValue(editor, restoredHistoryJSON, {
          restore: true,
          validateAgainst: after,
        }),
        after
      );
      LAST_AUTOMATIC_HISTORY_GROUP_TIME.delete(editor);
    }

    if (commit.annotations[documentReplacement.key]) {
      dropPendingHistoryReplayEntry(editor);
      if (!restoredHistoryJSON) {
        replaceHistoryState(
          editor,
          {
            redos: [],
            schema: captureHistoryState(editor)?.schema ?? schema,
            undos: [],
          },
          after
        );
      }
      LAST_AUTOMATIC_HISTORY_GROUP_TIME.delete(editor);
      return undefined;
    }

    if (dropped) {
      LAST_AUTOMATIC_HISTORY_GROUP_TIME.delete(editor);
      dropHistoryHead(editor, dropped === 'undo' ? 'undos' : 'redos', after);
      return undefined;
    }

    if (action) {
      LAST_AUTOMATIC_HISTORY_GROUP_TIME.delete(editor);
      if (!replayRequest) {
        throw new Error('History replay requires its owning service request.');
      }
      const source = action === 'undo' ? 'undos' : 'redos';
      const destination = action === 'undo' ? 'redos' : 'undos';
      const entry = peekHistoryEntry(editor, source, replayRequest);
      const batch = entry?.batch;

      if (!batch) {
        throw new Error(`Missing history batch for ${action}.`);
      }

      const { carried, rest, unsettle, ...moved } = batch;
      const taken = unsettle && kept(unsettle);
      const replayed = rest && kept(rest);
      const redoParts = action === 'redo' ? settledParts(commit, kept) : null;
      const unsettled =
        action === 'undo' && taken
          ? { after: taken.apply(before), change: taken }
          : undefined;
      // The redo of a two-part step takes back what the undo's admission
      // wrote, then replays the inverse of the rest, so its admission settles
      // the decision again against the document it then finds. Its caret
      // follows the letters the take-back keeps.
      const redone =
        unsettled && replayed
          ? {
              change: collapseDocumentElementPropertyWrites(
                admissionTakeBack(commit).compose(
                  replayed.invert(unsettled.after),
                  after
                ),
                after,
                historyReplaySchemaOf(editor).isSetValued
              ),
              selectionAfter: mapHistorySelection(
                editor,
                moved.selectionAfter,
                unsettled.change,
                before,
                unsettled.after,
                moved.selectionAfterRoot ?? MAIN_ROOT_KEY,
                true
              ),
            }
          : null;

      const change =
        redone?.change ??
        (unsettled
          ? redoWithoutSettlement(editor, inverse, unsettled.change, after)
          : inverse);
      const program = historyProgramOf(batch);
      const inverted =
        program && !redoParts
          ? invertedCarryProgram(
              historyReplaySchemaOf(editor),
              program,
              entry.base,
              after,
              change
            )
          : undefined;

      completeHistoryAction(
        editor,
        source,
        destination,
        withHistoryFacts(
          withHistoryProgram(
            {
              ...moved,
              ...redone,
              change,
              effects: effects.toReversed().map(invertEffect),
              ...redoParts,
              ...(inverted
                ? { carried: [inverted.run] }
                : carried && carriedBack(carried, change, after)),
            },
            inverted?.program
          ),
          inverseFacts(change)
        ),
        after,
        unsettled,
        replayRequest,
        { after, before, change: changes }
      );
      COMMIT_STEPS.set(commit, { how: action, identity: entry.identity });
      return Object.freeze({
        receipt: Object.freeze({
          group: entry.identity,
          selection: readHistoricSelection(
            editor,
            batch,
            action === 'undo' ? 'before' : 'after'
          ),
          version: commit.version,
        }),
        request: replayRequest,
      });
    }

    if (!shouldSaveCommit(commit, effects)) {
      if (commit.changed.hasAny('snapshot')) {
        LAST_AUTOMATIC_HISTORY_GROUP_TIME.delete(editor);
      }

      if (!commit.tags.includes('historic') && !changes.empty) {
        queuePendingHistoryReplayMapping(editor, changes, after);
        queueHistoryMapping(editor, changes, after, {
          before,
          facts,
          otherWriter: commit.tags.includes('collaboration'),
        });
      }
      return undefined;
    }

    if (
      effects.length === 0 &&
      !anchorCapture?.recovery &&
      isInternalDocumentChangeNoop(changes, before)
    ) {
      return undefined;
    }

    const sessionEffects = effects.filter(
      (effect) => typeof effect.type.history === 'object'
    );

    if (
      sessionEffects.length > 0 &&
      (!isRecordOnlyChange(changes) ||
        effects.length !== 1 ||
        sessionEffects.length !== 1)
    ) {
      throw new Error(
        'A session history effect must own one effect-only or record-only history batch.'
      );
    }

    const prepared = prepareHistoryBatch(inverse, commit, effects);

    if (!prepared) return undefined;

    const pendingReplayEdited = markPendingHistoryReplayEdited(editor);
    const parts = settledParts(commit, kept);
    const partedBatch = parts
      ? { ...prepared.batch, ...parts }
      : prepared.batch;
    const carried = carriedBack(
      getEditorCommitCarriedRuns(commit),
      partedBatch.change,
      after
    );
    const checked =
      !parts && carried?.carried.length === 1
        ? checkedCarryProgram(
            historyReplaySchemaOf(editor),
            after,
            partedBatch.change,
            carried.carried[0]
          )
        : undefined;
    const programBatch = checked
      ? withHistoryProgram(
          { ...partedBatch, carried: [checked.run] },
          checked.program
        )
      : carried
        ? { ...partedBatch, ...carried }
        : partedBatch;
    const preparedBatch = withHistoryFacts(
      programBatch,
      inverseFacts(programBatch.change)
    );
    const takesBackCommit =
      preparedBatch.change === inverse &&
      getInternalDocumentChangeRecords(commit.inverseChanges).size === 0;
    const lastEntry = peekJoinableUndoEntry(editor);

    for (const cause of takeDroppedHistoryCauses(editor)) {
      reportFailedHistoryReplay(editor, 'undo', cause);
    }
    const lastEntryHasSessionEffect = lastEntry?.batch.effects.some(
      (effect) => typeof effect.type.history === 'object'
    );
    const currentTime = globalThis.performance.now();
    const currentStartedAt = getEditorCommitStartedAt(commit);
    const previousAutomaticGroupTime =
      LAST_AUTOMATIC_HISTORY_GROUP_TIME.get(editor);
    const explicitMerge = commit.tags.includes('history-merge');
    // A settling commit stands alone, so redo works its settlement out again
    // from the change that settled and from nothing merged with it.
    const settles =
      commit.tags.includes(DOCUMENT_SETTLED_TAG) ||
      getEditorCommitRest(commit) !== null;
    // A step that carries a run stands alone too, so the runs stay in the
    // coordinates of the one change they describe.
    const boundary = commit.tags.includes(HISTORY_BOUNDARY_TAG);
    const explicitPush =
      commit.tags.includes('history-push') ||
      settles ||
      boundary ||
      carried !== null;
    const textInput =
      commit.tags.includes('native-text-input') ||
      commit.tags.includes('dom-text-input');
    const composition = commit.tags.includes('composition');
    const effectsCompatible = false;
    const withinAutomaticWindow =
      previousAutomaticGroupTime !== undefined &&
      Math.max(0, currentStartedAt - previousAutomaticGroupTime) <=
        getHistoryNewBatchDelay(options);
    const nativeMerge = canMergeNativeHistory(
      prepared.group?.native,
      lastEntry?.group?.native,
      withinAutomaticWindow
    );
    const compositionMerge = Boolean(
      prepared.group?.native?.composition !== undefined &&
      prepared.group.native.origin === lastEntry?.group?.native?.origin &&
      prepared.group.native.composition ===
        lastEntry?.group?.native?.composition
    );
    const merge =
      !pendingReplayEdited &&
      lastEntry != null &&
      !lastEntry.group?.closed &&
      !lastEntry.batch.unsettle &&
      !lastEntry.batch.carried &&
      !lastEntryHasSessionEffect &&
      sessionEffects.length === 0 &&
      !explicitPush &&
      (explicitMerge
        ? shouldMergeExplicitBatch(
            preparedBatch,
            prepared.group,
            lastEntry.batch,
            lastEntry.group,
            textInput && !composition,
            effectsCompatible
          )
        : nativeMerge &&
          (compositionMerge
            ? shouldMergeCompositionBatch(prepared.group, lastEntry.group)
            : preparedBatch.effects.length === 0 &&
              shouldMergeBatch(
                preparedBatch,
                prepared.group,
                lastEntry.batch,
                lastEntry.group,
                effectsCompatible
              )));

    const savedEdges = {
      after: {
        root: preparedBatch.selectionAfterRoot,
        selection: preparedBatch.selectionAfter,
      },
      before: {
        root: preparedBatch.selectionBeforeRoot,
        selection: preparedBatch.selectionBefore,
      },
    };

    if (lastEntry && merge) {
      COMMIT_ENTRIES.set(commit, {
        after: savedEdges.after,
        before: {
          root: lastEntry.batch.selectionBeforeRoot,
          selection: lastEntry.batch.selectionBefore,
        },
        entry: lastEntry.identity,
        how: 'merge',
        made: getAuthoredUpdateView(editor),
      });
      if (knownHistoryStepId(lastEntry.identity)) {
        COMMIT_STEPS.set(commit, {
          how: 'merge',
          identity: lastEntry.identity,
        });
      }

      const { selectionAfterRoot: _selectionAfterRoot, ...previousBatch } =
        lastEntry.batch;
      const factsOf = (batch: Batch): ChangeFacts =>
        historyFactsOf(batch) ?? UNKNOWN_FACTS;
      const mergedBatch = {
        ...previousBatch,
        change: preparedBatch.change.compose(
          lastEntry.batch.change,
          toChangeValue(after)
        ),
        effects: [...preparedBatch.effects, ...lastEntry.batch.effects],
        selectionAfter: preparedBatch.selectionAfter,
        ...(preparedBatch.selectionAfterRoot
          ? { selectionAfterRoot: preparedBatch.selectionAfterRoot }
          : {}),
      };
      const mergedGroup = mergeHistoryBatchGroups(
        lastEntry.group,
        prepared.group
      );
      const previousRecovery = mapAnchorHistoryRecovery(
        lastEntry.recovery,
        'after',
        { after, before: lastEntry.base, change: changes, facts: null }
      );
      const currentRecovery = anchorCapture?.recovery
        ? mapAnchorHistoryRecovery(anchorCapture.recovery, 'before', {
            after: lastEntry.batch.change.apply(toChangeValue(lastEntry.base)),
            before: lastEntry.base,
            change: lastEntry.batch.change,
            facts: null,
          })
        : null;
      const mergedRecovery = mergeAnchorHistoryRecovery(
        previousRecovery,
        currentRecovery,
        lastEntry.anchorCeiling
      );

      const mergedFacts = composeFacts(
        preparedBatch.change,
        factsOf(preparedBatch),
        lastEntry.batch.change,
        factsOf(lastEntry.batch)
      );

      const joined = withHistoryFacts(mergedBatch, mergedFacts);

      replaceHistoryHead(editor, joined, after, {
        anchorCeiling: lastEntry.anchorCeiling,
        carets: mergeHistoryCarets(
          editor,
          {
            batch: lastEntry.batch,
            carets: lastEntry.carets,
            undo: () => ({
              after: lastEntry.batch.change.apply(
                toChangeValue(lastEntry.base)
              ) as EditorDocumentValue,
              before: lastEntry.base,
              change: lastEntry.batch.change,
            }),
          },
          {
            batch: preparedBatch,
            carets,
            redo: () => ({ after, before: lastEntry.base, change: changes }),
          }
        ),
        clearRedos: true,
        commit: { after, before, change: changes },
        group: mergedGroup,
        recovery: mergedRecovery,
        ...(takesBackCommit && lastEntry.restores
          ? { restores: lastEntry.restores }
          : {}),
      });
    } else {
      const recordToken = historyRecord.of(commit);
      const freezes =
        !!recordToken?.write &&
        !pendingReplayEdited &&
        !!captureHistoryState(editor)?.redos;
      const identity = writeHistory(editor, preparedBatch, after, {
        anchorCeiling: anchorCapture?.anchorCeiling ?? 0,
        carets,
        clearRedos: !freezes,
        commit: { after, before, change: changes },
        group: boundary
          ? Object.freeze({
              ...(prepared.group ?? { kind: 'document', roots: [] }),
              closed: true,
            })
          : settles && prepared.group
            ? Object.freeze({ ...prepared.group, closed: true })
            : prepared.group,
        recovery: anchorCapture?.recovery ?? null,
        ...(takesBackCommit ? { restores: before } : {}),
      });

      if (freezes) joinRedoFreeze(editor, identity);
      if (recordToken) {
        ON_COMMIT_PUBLISHED.set(commit, () => {
          recordToken.published = true;
          if (recordToken.write) startFirstWrite(recordToken.write, identity);
        });
      }
      COMMIT_STEPS.set(commit, { how: 'push', identity });
      COMMIT_ENTRIES.set(commit, {
        ...savedEdges,
        entry: identity,
        how: 'push',
        made: getAuthoredUpdateView(editor),
      });
    }
    if (explicitPush || preparedBatch.effects.length > 0) {
      LAST_AUTOMATIC_HISTORY_GROUP_TIME.delete(editor);
    } else {
      LAST_AUTOMATIC_HISTORY_GROUP_TIME.set(editor, currentTime);
    }

    return undefined;
  };
  return definePlugin('history', {
    api({ editor }) {
      const applyReplay = (direction: HistoryAction): HistoryOutcome => {
        const request = nextHistoryReplayRequest;
        nextHistoryReplayRequest += 1;
        let hasEntry = false;
        let failedAt: 'commit' | 'replay' | null = null;
        let blocked: HistoryOutcome | null = null;
        const attempt = (canonical: boolean, trial?: SpeculativeUpdate) => {
          failedAt = null;
          return blockedOf(
            editor,
            (tx) => {
              try {
                hasEntry = applyHistoryAction(
                  editor,
                  tx,
                  direction,
                  getEditorUpdateRoot(editor),
                  request,
                  canonical
                );
              } catch (error) {
                failedAt = 'replay';
                throw error;
              }
              failedAt = 'commit';
            },
            { speculative: trial }
          );
        };

        const replayEntry = () => {
          try {
            return attempt(false);
          } catch (error) {
            if (
              !failedAt ||
              !(error instanceof EditorNoncanonicalChangeError)
            ) {
              throw error;
            }
            PREPARED_HISTORY_REPLAYS.delete(request);
            return attempt(true);
          }
        };

        const trial: SpeculativeUpdate = { committed: false };
        let keptError: Readonly<{ value: unknown }> | null = null;

        try {
          const kept =
            direction === 'redo'
              ? attachKeptHistoryRedo(editor, request)
              : null;

          if (kept) {
            try {
              attempt(false, trial);
            } catch (error) {
              if (PREPARED_HISTORY_REPLAYS.has(request) || trial.committed) {
                throw error;
              }
              if (failedAt && !(error instanceof EditorSchemaValidationError)) {
                keptError = { value: error };
              }
            } finally {
              kept.detach();
            }
            if (!PREPARED_HISTORY_REPLAYS.has(request)) {
              const release = kept.fallBack();

              countCoreWork('keptRedoFallbacks');
              try {
                blocked = replayEntry();
              } finally {
                if (!PREPARED_HISTORY_REPLAYS.has(request)) release();
              }
            }
          } else {
            blocked = replayEntry();
          }
        } catch (error) {
          PREPARED_HISTORY_REPLAYS.delete(request);
          if (!failedAt) throw error;
          if (failedAt === 'replay') {
            dropFailedHistoryHead(editor, direction, error);
          } else {
            reportFailedHistoryReplay(editor, direction, error);
          }
          return FAILED_HISTORY_RESULT;
        }
        if (keptError) {
          reportFailedHistoryReplay(editor, direction, keptError.value);
        }
        if (blocked) return blocked;
        if (!hasEntry) return EMPTY_HISTORY_RESULT;

        const receipt = PREPARED_HISTORY_REPLAYS.get(request);
        PREPARED_HISTORY_REPLAYS.delete(request);
        if (!receipt) {
          throw new Error('History replay completed without a receipt.');
        }
        const result = Object.freeze({
          status: 'applied',
        }) satisfies HistoryOutcome;

        recordEditorHistoryReplayReceipt(result, receipt);
        return result;
      };
      const replaySession = (
        direction: HistoryAction,
        entry: NonNullable<ReturnType<typeof peekHistoryEntry>>,
        sessionEffect: EditorEffect
      ): HistoryResult => {
        const sessionHistory = sessionEffect.type.history;

        if (typeof sessionHistory !== 'object') {
          throw new Error(
            `Session history effect "${sessionEffect.type.key}" has no replay owner.`
          );
        }

        const owner = getEditorRuntimeOwner(editor);
        const activation = HISTORY_ACTIVATION.get(owner);
        if (!activation) return EMPTY_HISTORY_RESULT;

        const request = nextHistoryReplayRequest;
        nextHistoryReplayRequest += 1;
        const root = getEditorUpdateRoot(editor);
        // The store's claim says whether this replay still settles, so a
        // configure that keeps the store keeps it settleable, and the check
        // creates no store after deactivation.
        const holdsClaim = () =>
          captureHistoryState(editor)?.pendingReplay?.request === request;
        const report = (cause: unknown) =>
          reportEditorLifecycleError({
            cause,
            direction,
            editor,
            phase: 'replay',
            source: 'history',
          });
        const settleBlocked = () => {
          getEditorRuntime(owner).update(
            (tx) => {
              tx.annotations.set(historyReplaySettlement, {
                request,
                status: 'blocked',
              });
            },
            { ignoreGuardRefusals: true }
          );
        };
        const fail = (cause: unknown): HistorySettlement => {
          if (holdsClaim()) {
            try {
              settleBlocked();
            } catch (clearError) {
              if (clearError !== cause) report(clearError);
            }
          }
          report(cause);
          return FAILED_HISTORY_RESULT;
        };

        PENDING_HISTORY_REPLAY_CLAIMS.set(request, {
          activation,
          direction,
          identity: entry.identity,
          request,
          undoAnchor:
            direction === 'redo'
              ? (peekHistoryEntry(editor, 'undos')?.identity ?? null)
              : null,
        });
        let claimBlocked;
        try {
          claimBlocked = blockedOf(editor, (tx) => {
            tx.annotations.set(historyReplayClaim, request);
          });
        } catch (error) {
          if (!holdsClaim()) throw error;
          return fail(error);
        } finally {
          PENDING_HISTORY_REPLAY_CLAIMS.delete(request);
        }
        if (!holdsClaim()) return claimBlocked ?? FAILED_HISTORY_RESULT;

        const settle = (
          ownerResult: EditorEffectHistoryReplayResult
        ): HistorySettlement => {
          try {
            if (!holdsClaim()) {
              return ownerResult.status === 'applied'
                ? Object.freeze({ status: 'applied' })
                : ownerResult;
            }
            if (ownerResult.status === 'blocked') {
              settleBlocked();
              return ownerResult;
            }

            const replayedEffect = createEditorEffect(
              sessionEffect.type,
              ownerResult.value
            );
            const companionChange = survivingSessionRecordChange(
              entry.base,
              getEditorDocumentValue(owner),
              entry.origin?.outside ?? null,
              keptHistoryChange(editor, entry.batch.change)
            );
            getEditorRuntime(owner).update(
              (tx) => {
                runHistoricUpdate(editor, root, tx, entry.batch, () => {
                  if (!companionChange.empty) {
                    applyDocumentChange(owner, companionChange);
                  }
                  tx.effects.emit(replayedEffect.type, replayedEffect.value);
                });
                tx.annotations.set(historyReplaySettlement, {
                  request,
                  status: 'applied',
                });
              },
              { ignoreGuardRefusals: true }
            );

            const receipt = PREPARED_HISTORY_REPLAYS.get(request);
            PREPARED_HISTORY_REPLAYS.delete(request);
            if (holdsClaim()) {
              settleBlocked();
              return FAILED_HISTORY_RESULT;
            }
            const result = Object.freeze({
              status: 'applied',
            }) satisfies HistorySettlement;

            if (receipt) recordEditorHistoryReplayReceipt(result, receipt);
            return result;
          } catch (error) {
            PREPARED_HISTORY_REPLAYS.delete(request);
            return fail(error);
          }
        };

        const write =
          direction === 'undo' ? firstWriteOf(entry.identity) : undefined;
        let ownerResult;
        try {
          ownerResult = sessionHistory.replay(
            editor,
            sessionEffect.value,
            Object.freeze({ firstWrite: write?.parsed ?? null })
          );
        } catch (error) {
          return fail(error);
        }
        if (
          typeof (ownerResult as { then?: unknown } | null | undefined)
            ?.then !== 'function'
        ) {
          return settle(ownerResult as EditorEffectHistoryReplayResult);
        }

        // A first write that answers `blocked` first withdraws the step and
        // settles this undo; the owner's later answer is dropped.
        let withdrawn = false;
        const owned = Promise.resolve(ownerResult).then(
          (result) => {
            if (withdrawn) return FAILED_HISTORY_RESULT;
            if (write) write.settleUndo = null;
            return settle(result);
          },
          (error: unknown) => {
            if (withdrawn) return FAILED_HISTORY_RESULT;
            if (write) write.settleUndo = null;
            return fail(error);
          }
        );

        return Object.freeze({
          settled:
            write?.state === 'running'
              ? Promise.race([
                  new Promise<HistorySettlement>((resolve) => {
                    write.settleUndo = (settlement) => {
                      withdrawn = true;
                      resolve(settlement);
                    };
                  }),
                  owned,
                ])
              : owned,
          status: 'pending',
        });
      };
      const replayHead = (direction: HistoryAction): HistoryResult => {
        const owner = getEditorRuntimeOwner(editor);

        if (isInTransaction(owner) || isBuildingTransactionSpec(owner)) {
          throw new Error(
            'History replay cannot run inside editor.update or a transaction spec.'
          );
        }
        if (readPendingHistoryReplay(editor)) return BUSY_HISTORY_RESULT;

        let entry: ReturnType<typeof peekHistoryEntry>;
        const drops = crossingDropCount(editor);
        const frozenRedo = () => {
          if (direction !== 'redo' || !isRedoFrozen(editor)) return null;

          return resolveFrozenRedo(editor)
            ? BUSY_HISTORY_RESULT
            : EMPTY_HISTORY_RESULT;
        };

        try {
          const stack = direction === 'undo' ? 'undos' : 'redos';
          const frozen = frozenRedo();

          if (frozen) return frozen;
          entry = peekHistoryEntry(editor, stack);
          while (
            entry &&
            entry.batch.effects.length === 0 &&
            !entry.batch.change.empty &&
            keptHistoryChange(editor, entry.batch.change).empty
          ) {
            dropHistoryHeadStep(editor, direction, {
              ignoreGuardRefusals: true,
            });
            // A commit listener can record during the drop.
            if (readPendingHistoryReplay(editor)) return BUSY_HISTORY_RESULT;
            const frozenAfterDrop = frozenRedo();

            if (frozenAfterDrop) return frozenAfterDrop;
            const head = peekHistoryEntry(editor, stack);

            if (head?.identity === entry.identity) return FAILED_HISTORY_RESULT;
            entry = head;
          }
        } catch (error) {
          dropFailedHistoryHead(editor, direction, error);
          return FAILED_HISTORY_RESULT;
        }
        if (crossingDropCount(editor) !== drops) return FAILED_HISTORY_RESULT;

        if (!entry) return EMPTY_HISTORY_RESULT;

        const sessionEffect = entry.batch.effects.find(
          (effect) => typeof effect.type.history === 'object'
        );

        return sessionEffect
          ? replaySession(direction, entry, sessionEffect)
          : applyReplay(direction);
      };
      const replay = (direction: HistoryAction): HistoryResult => {
        try {
          return replayHead(direction);
        } finally {
          for (const cause of takeDroppedHistoryCauses(editor)) {
            reportFailedHistoryReplay(editor, direction, cause);
          }
        }
      };

      return {
        redo: () => replay('redo'),
        undo: () => replay('undo'),
      } satisfies HistoryApi;
    },
    enabled: options.enabled as TEnabled,
    read({ editor }) {
      return Object.assign(() => readHistory(editor), {
        hasRedo: () =>
          withPublishedHistoryState(
            editor,
            () =>
              !isRedoFrozen(editor) &&
              peekHistoryEntry(editor, 'redos') !== undefined
          ),
        hasUndo: () =>
          withPublishedHistoryState(
            editor,
            () => peekHistoryEntry(editor, 'undos') !== undefined
          ),
        pending: () =>
          withPublishedHistoryState(
            editor,
            () => readPendingHistoryReplay(editor)?.direction ?? null
          ),
      }) satisfies HistoryStateApi;
    },
    update({ editor, tx }) {
      return {
        merge: createHistoryControl(tx, 'merge'),
        newBatch: createHistoryControl(tx, 'push'),
        restore: txLocate(false, (value) => {
          if (!History.isHistory(value)) {
            throw new Error('tx.history.restore requires decoded history.');
          }

          tx.tags.add('history-skip');
          tx.tags.add('history-restore');
          tx.annotations.set(
            historyRestore,
            encodeHistoryValue(editor, value, { validateAgainst: false })
          );
        }),
        skip: createHistoryControl(tx, 'skip'),
      } satisfies HistoryTxApi;
    },
    activate(context) {
      const { editor } = context;
      const owner = getEditorRuntimeOwner(editor);
      const previousActivation = HISTORY_ACTIVATION.get(owner);
      const previousPendingSchemaActivation =
        PENDING_HISTORY_SCHEMA_ACTIVATION.get(editor);
      const previousAutomaticGroupTime =
        LAST_AUTOMATIC_HISTORY_GROUP_TIME.get(editor);
      const previousState = captureHistoryState(editor);
      const activation = {};
      const configured = withHistoryStateDraft(editor, previousState, () => {
        const schemaChanged = configureHistoryState(
          editor,
          getHistoryMaxDepth(options),
          context.schema.identity()
        );

        if (schemaChanged) dropPendingHistoryReplayEntry(editor);
        return schemaChanged;
      });
      const activationState = configured.state;
      let activationPublished = false;

      HISTORY_ACTIVATION.set(owner, activation);
      LAST_AUTOMATIC_HISTORY_GROUP_TIME.delete(editor);
      context.onCleanup(
        registerEditorHistoryRuntime(editor, {
          entryOf: (commit) => COMMIT_ENTRIES.get(commit) ?? null,
          forgetStep: (step) => forgetHistoryStep(editor, step),
          headRoots: (direction) => readHeadRoots(editor, direction),
          mintStepOf: (commit) => commitStepWith(commit, historyStepId),
          record: (caller, effect, value, recordOptions) =>
            recordHistoryStep(caller, effect, value, recordOptions),
          replaceUndoStep: (step, change, matches) =>
            replaceUndoStep(editor, step, change, matches),
          restores: (commit) =>
            commit.annotations[historyRestore.key] !== undefined,
          stepOf: (commit) => commitStepWith(commit, knownHistoryStepId),
        })
      );
      context.onCleanup(
        registerEditorTransactionGuard(editor, (guarded) => {
          if (HISTORY_ACTIVATION.get(owner) !== activation) return undefined;
          const beforeTime = LAST_AUTOMATIC_HISTORY_GROUP_TIME.get(editor);
          const restoreTime = (time: number | undefined) => {
            if (time === undefined) {
              LAST_AUTOMATIC_HISTORY_GROUP_TIME.delete(editor);
            } else {
              LAST_AUTOMATIC_HISTORY_GROUP_TIME.set(editor, time);
            }
          };
          let next;
          let nextReplay: PreparedHistoryReplay | undefined;
          let nextTime;
          let published: (() => void) | undefined;
          try {
            const prepared = withHistoryStateDraft(
              editor,
              activationPublished
                ? captureHistoryState(editor)
                : activationState,
              () => reduceHistory({ ...guarded, editor })
            );
            nextReplay = prepared.result;
            next = prepared.state;
            nextTime = LAST_AUTOMATIC_HISTORY_GROUP_TIME.get(editor);
            published = ON_COMMIT_PUBLISHED.get(guarded.commit);
            ON_COMMIT_PUBLISHED.delete(guarded.commit);
          } finally {
            restoreTime(beforeTime);
          }
          return () => {
            restoreHistoryState(editor, next);
            restoreTime(nextTime);
            activationPublished = true;
            if (nextReplay) {
              PREPARED_HISTORY_REPLAYS.set(
                nextReplay.request,
                nextReplay.receipt
              );
            }
            published?.();
          };
        })
      );
      context.onCleanup(({ reason }) => {
        if (PENDING_HISTORY_SCHEMA_ACTIVATION.get(editor) === activation) {
          PENDING_HISTORY_SCHEMA_ACTIVATION.delete(editor);
        }
        if (HISTORY_ACTIVATION.get(owner) !== activation) return;

        if (reason === 'rollback') {
          restoreHistoryState(editor, previousState);
          if (previousActivation) {
            HISTORY_ACTIVATION.set(owner, previousActivation);
          } else {
            HISTORY_ACTIVATION.delete(owner);
          }
          if (previousPendingSchemaActivation) {
            PENDING_HISTORY_SCHEMA_ACTIVATION.set(
              editor,
              previousPendingSchemaActivation
            );
          }
          if (previousAutomaticGroupTime !== undefined) {
            LAST_AUTOMATIC_HISTORY_GROUP_TIME.set(
              editor,
              previousAutomaticGroupTime
            );
          }
          return;
        }

        clearHistoryState(editor);
        LAST_AUTOMATIC_HISTORY_GROUP_TIME.delete(editor);
        HISTORY_ACTIVATION.delete(owner);
      });
      if (configured.result) {
        PENDING_HISTORY_SCHEMA_ACTIVATION.set(editor, activation);
      }
      context.afterPublish(() => {
        if (
          !activationPublished &&
          HISTORY_ACTIVATION.get(owner) === activation
        ) {
          restoreHistoryState(editor, activationState);
          activationPublished = true;
        }
        if (PENDING_HISTORY_SCHEMA_ACTIVATION.get(editor) === activation) {
          PENDING_HISTORY_SCHEMA_ACTIVATION.delete(editor);
        }
      });
    },
    on: {},
    validate() {
      getHistoryMaxDepth(options);
      getHistoryNewBatchDelay(options);
    },
  }) as HistoryPlugin<TEnabled>;
};

/** Create the inverse-change history plugin. */
export const history = <const TEnabled extends boolean | undefined = undefined>(
  options: HistoryOptions<TEnabled> = {}
): HistoryPlugin<TEnabled> => createHistoryPlugin(options);
