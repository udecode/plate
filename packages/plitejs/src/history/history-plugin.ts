import {
  definePlugin,
  defineUpdateAnnotation,
  type DocumentChange,
  type Editor,
  type EditorCommit,
  type EditorDocumentValue,
  type EditorEffect,
  type EditorSchemaIdentity,
  type Plugin,
  type PluginTypeProvider,
  type EditorUpdateTransaction,
  type Selection,
  SelectionApi,
  type TextSelection,
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
import {
  isAuthoredHistoryEffect,
  canMergeAuthoredHistory,
  captureAuthoredHistory,
  getAuthoredHistoryConflicts,
} from '../core/authored-runtime';
import { getEditorRuntimeOwner } from '../core/editor-runtime';
import { MAIN_ROOT_KEY } from '../core/public-root';
import {
  documentReplacement,
  getEditorUpdateRoot,
  isBuildingTransactionSpec,
  isInTransaction,
  type EditorHistoryReplayReceipt,
  recordEditorHistoryReplayReceipt,
  registerEditorHistoryRuntime,
  registerEditorTransactionGuard,
} from '../core/public-state';
import { type Batch, History, type HistoryJSON } from './history';
import { decodeHistoryValue, encodeHistoryValue } from './history-codec';
import {
  createHistoryBatchGroup,
  type HistoryBatchGroup,
  type NativeHistoryGrouping,
  isSameHistoryPath,
  mergeHistoryBatchGroups,
  shouldMergeBatch,
  shouldMergeCompositionBatch,
  shouldMergeExplicitBatch,
} from './history-merge-policy';
import {
  cloneSelection,
  restoreHistoricSelection,
  shouldPreserveHistoricDOMSelection,
  shouldRestoreHistoricSelection,
} from './history-selection';
import {
  captureHistoryState,
  clearHistoryState,
  completeHistoryAction,
  configureHistoryState,
  getHistory,
  getWorkingHistory,
  peekHistoryEntry,
  queueHistoryMapping,
  replaceHistoryHead,
  replaceHistoryState,
  restoreHistoryState,
  withHistoryStateDraft,
  withPublishedHistoryState,
  writeHistory,
} from './history-state';

const failInvariant = (message: string): never => {
  throw new Error(message);
};

export type HistoryStateApi<V extends Value = Value> = (() => History<V>) & {
  /** Return whether the redo branch has a surviving mapped batch. */
  hasRedo: () => boolean;
  /** Return whether the undo branch has a surviving mapped batch. */
  hasUndo: () => boolean;
};

export type HistoryResult =
  | Readonly<{ status: 'applied' | 'empty' }>
  | Readonly<{ conflicts: readonly string[]; status: 'blocked' }>;

export type HistoryApi = {
  /** Replay the current redo batch as one complete editor update. */
  redo: () => HistoryResult;
  /** Replay the current undo batch as one complete editor update. */
  undo: () => HistoryResult;
};

export type HistoryControlTx = TxOnlyMethod<() => void>;

export type HistoryTxApi<V extends Value = Value> = {
  /** Merge this transaction into the previous compatible undo batch. */
  merge: HistoryControlTx;
  /** Make this transaction start a fresh undo batch. */
  newBatch: HistoryControlTx;
  /** Replace both history branches when the surrounding transaction commits. */
  restore: (history: History<V>) => void;
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

const historyReplayRequest = defineUpdateAnnotation<number>({
  combine: (_previous, next) => next,
  key: 'history.replay-request',
});

type PreparedHistoryReplay = Readonly<{
  receipt: EditorHistoryReplayReceipt;
  request: number;
}>;

const PREPARED_HISTORY_REPLAYS = new Map<number, EditorHistoryReplayReceipt>();
let nextHistoryReplayRequest = 1;
const EMPTY_HISTORY_RESULT = Object.freeze({
  status: 'empty',
}) satisfies HistoryResult;

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

const runHistoricUpdate = <V extends Value>(
  root: string,
  tx: HistoryTransaction<V>,
  batch: Batch<V>,
  fn: () => void
) => {
  const stateOnly = batch.change.empty && batch.effects.length > 0;
  const preserveSelection =
    stateOnly || shouldPreserveHistoricDOMSelection(root, batch);

  tx.tags.add('semantic-command');
  tx.tags.add('history-skip');
  tx.tags.add('historic');

  if (preserveSelection) {
    tx.tags.add('skip-dom-selection');
    tx.tags.add('skip-selection-focus');
    tx.tags.add('skip-scroll-into-view');
  }

  fn();
};

const toChangeValue = <V extends Value>(
  value: EditorDocumentValue<V>
): { children: V; roots?: Record<string, V> } => ({
  children: value.children,
  ...(value.roots ? { roots: value.roots } : {}),
});

const consumeHistoryBatch = <V extends Value>(
  tx: HistoryTransaction<V>,
  batch: Batch<V>,
  direction: 'redo' | 'undo',
  root: string
) => {
  if (!batch.effects.some(isAuthoredHistoryEffect)) {
    tx.changes.apply(batch.change);
  }
  for (const effect of batch.effects) {
    tx.effects.emit(effect.type, effect.value);
  }
  if (
    !batch.effects.some(isAuthoredHistoryEffect) &&
    shouldRestoreHistoricSelection(
      root,
      batch,
      direction === 'undo' ? 'before' : 'after'
    )
  ) {
    restoreHistoricSelection(
      tx,
      batch,
      root,
      direction === 'undo' ? 'before' : 'after'
    );
  }
};

const applyHistoryAction = <V extends Value>(
  editor: Editor<V>,
  tx: HistoryTransaction<V>,
  direction: HistoryAction,
  root: string,
  request: number
) => {
  const entry = peekHistoryEntry(
    editor,
    direction === 'undo' ? 'undos' : 'redos'
  );

  if (!entry) return false;

  stageAnchorHistoryRecovery(
    getEditorRuntimeOwner(editor),
    entry.recovery,
    direction === 'undo' ? 'before' : 'after'
  );

  runHistoricUpdate(root, tx, entry.batch, () => {
    consumeHistoryBatch(tx, entry.batch, direction, root);
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

const readNativeHistoryGrouping = (
  commit: EditorCommit
): NativeHistoryGrouping | undefined => {
  const value = commit.annotations['history.native-grouping-input'];

  if (
    typeof value !== 'object' ||
    value === null ||
    !Number.isSafeInteger(Reflect.get(value, 'origin'))
  ) {
    return undefined;
  }
  const composition = Reflect.get(value, 'composition');

  if (composition !== undefined && !Number.isSafeInteger(composition)) {
    return undefined;
  }

  return Object.freeze({
    origin: Reflect.get(value, 'origin') as number,
    ...(composition === undefined
      ? {}
      : { composition: composition as number }),
  });
};

const canMergeNativeHistory = (
  current: NativeHistoryGrouping | undefined,
  previous: NativeHistoryGrouping | undefined,
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
  effects: readonly EditorEffect[],
  grouping?: NonNullable<ReturnType<typeof captureAuthoredHistory>>['grouping']
): Readonly<{
  batch: Batch<V>;
  group: HistoryBatchGroup | null;
}> | null => {
  const baseGroup = createHistoryBatchGroup(grouping?.commit ?? commit);
  const native = readNativeHistoryGrouping(commit);
  const group: HistoryBatchGroup | null = grouping
    ? Object.freeze({
        ...(baseGroup ?? { kind: 'effects', root: undefined }),
        ...(native ? { native } : {}),
        scope: grouping.scope,
      })
    : baseGroup
      ? Object.freeze({ ...baseGroup, ...(native ? { native } : {}) })
      : null;
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
    isNativeTextInput: !grouping && commit.tags.includes('native-text-input'),
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
    commit,
    editor,
    schema,
  }: {
    after: EditorDocumentValue;
    commit: EditorCommit;
    editor: Editor;
    schema: EditorSchemaIdentity;
  }): PreparedHistoryReplay | undefined => {
    const anchorCapture = consumeAnchorHistoryCapture(commit);

    if (
      configureHistoryState(editor, getHistoryMaxDepth(options), schema) ||
      PENDING_HISTORY_SCHEMA_ACTIVATION.has(editor)
    ) {
      LAST_AUTOMATIC_HISTORY_GROUP_TIME.delete(editor);
      return undefined;
    }

    const { changes } = commit;
    const { inverseChanges } = commit;

    const authoredCapture = captureAuthoredHistory(editor, commit);
    const effects =
      authoredCapture?.effects ??
      commit.effects.filter((effect) => effect.type.history === 'push');
    const action = commit.annotations[historyAction.key] as
      | HistoryAction
      | undefined;
    const replayRequest = commit.annotations[historyReplayRequest.key] as
      | number
      | undefined;
    const restoredHistoryJSON = commit.annotations[historyRestore.key] as
      | HistoryJSON
      | undefined;

    if (restoredHistoryJSON) {
      replaceHistoryState(
        editor,
        decodeHistoryValue(editor, restoredHistoryJSON, {
          validateDocument: false,
        }),
        after
      );
      LAST_AUTOMATIC_HISTORY_GROUP_TIME.delete(editor);
    }

    if (commit.annotations[documentReplacement.key]) {
      if (!restoredHistoryJSON) {
        replaceHistoryState(
          editor,
          {
            redos: [],
            schema: getWorkingHistory(editor).schema,
            undos: [],
          },
          after
        );
      }
      LAST_AUTOMATIC_HISTORY_GROUP_TIME.delete(editor);
      return undefined;
    }

    if (action) {
      LAST_AUTOMATIC_HISTORY_GROUP_TIME.delete(editor);
      const source = action === 'undo' ? 'undos' : 'redos';
      const destination = action === 'undo' ? 'redos' : 'undos';
      const entry = peekHistoryEntry(editor, source);
      const batch = entry?.batch;

      if (!batch) {
        throw new Error(`Missing history batch for ${action}.`);
      }

      completeHistoryAction(
        editor,
        source,
        destination,
        {
          ...batch,
          change: inverseChanges,
          effects: effects.toReversed().map(invertEffect),
        },
        after
      );
      if (!replayRequest) {
        throw new Error('History replay requires its owning service request.');
      }
      return Object.freeze({
        receipt: Object.freeze({
          group: entry.identity,
          version: commit.version,
        }),
        request: replayRequest,
      });
    }

    if (!shouldSaveCommit(commit, effects)) {
      LAST_AUTOMATIC_HISTORY_GROUP_TIME.delete(editor);

      if (!commit.tags.includes('historic') && !changes.empty) {
        const before = inverseChanges.apply(toChangeValue(after));

        queueHistoryMapping(editor, changes, before);
      }
      return undefined;
    }

    const prepared = prepareHistoryBatch(
      inverseChanges,
      commit,
      effects,
      authoredCapture?.grouping
    );

    if (!prepared) return undefined;

    const preparedBatch = prepared.batch;
    const lastEntry = peekHistoryEntry(editor, 'undos');
    const currentTime = globalThis.performance.now();
    const previousAutomaticGroupTime =
      LAST_AUTOMATIC_HISTORY_GROUP_TIME.get(editor);
    const explicitMerge = commit.tags.includes('history-merge');
    const explicitPush = commit.tags.includes('history-push');
    const textInput =
      commit.tags.includes('native-text-input') ||
      commit.tags.includes('dom-text-input');
    const composition = commit.tags.includes('composition');
    const authoredInput = authoredCapture !== undefined && textInput;
    const effectsCompatible =
      lastEntry != null &&
      canMergeAuthoredHistory(
        editor,
        preparedBatch.effects,
        lastEntry.batch.effects
      );
    const withinAutomaticWindow =
      previousAutomaticGroupTime !== undefined &&
      currentTime - previousAutomaticGroupTime <=
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
      lastEntry != null &&
      !explicitPush &&
      (explicitMerge
        ? (!authoredCapture || effectsCompatible) &&
          (!authoredInput || composition || withinAutomaticWindow) &&
          shouldMergeExplicitBatch(
            preparedBatch,
            prepared.group,
            lastEntry.batch,
            lastEntry.group,
            textInput && !composition,
            effectsCompatible
          )
        : nativeMerge &&
          (preparedBatch.effects.length === 0 || authoredInput) &&
          (compositionMerge
            ? shouldMergeCompositionBatch(
                preparedBatch,
                prepared.group,
                lastEntry.batch,
                lastEntry.group,
                effectsCompatible
              )
            : shouldMergeBatch(
                preparedBatch,
                prepared.group,
                lastEntry.batch,
                lastEntry.group,
                effectsCompatible
              )));

    if (lastEntry && merge) {
      const { selectionAfterRoot: _selectionAfterRoot, ...previousBatch } =
        lastEntry.batch;
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
        changes,
        lastEntry.base,
        after
      );
      const currentRecovery = anchorCapture?.recovery
        ? mapAnchorHistoryRecovery(
            anchorCapture.recovery,
            'before',
            lastEntry.batch.change,
            lastEntry.base,
            lastEntry.batch.change.apply(toChangeValue(lastEntry.base))
          )
        : null;
      const mergedRecovery = mergeAnchorHistoryRecovery(
        previousRecovery,
        currentRecovery,
        lastEntry.anchorCeiling
      );

      replaceHistoryHead(editor, 'undos', mergedBatch, after, {
        anchorCeiling: lastEntry.anchorCeiling,
        clearRedos: true,
        group: mergedGroup,
        recovery: mergedRecovery,
      });
    } else {
      writeHistory(editor, 'undos', preparedBatch, after, {
        anchorCeiling: anchorCapture?.anchorCeiling ?? 0,
        clearRedos: true,
        group: prepared.group,
        recovery: anchorCapture?.recovery ?? null,
      });
    }
    if (explicitPush || (preparedBatch.effects.length > 0 && !authoredInput)) {
      LAST_AUTOMATIC_HISTORY_GROUP_TIME.delete(editor);
    } else {
      LAST_AUTOMATIC_HISTORY_GROUP_TIME.set(editor, currentTime);
    }

    return undefined;
  };
  return definePlugin('history', {
    api({ editor }) {
      const replay = (direction: HistoryAction): HistoryResult => {
        const owner = getEditorRuntimeOwner(editor);

        if (isInTransaction(owner) || isBuildingTransactionSpec(owner)) {
          throw new Error(
            'History replay cannot run inside editor.update or a transaction spec.'
          );
        }
        const request = nextHistoryReplayRequest;
        nextHistoryReplayRequest += 1;
        let hasEntry = false;

        try {
          editor.update((tx) => {
            hasEntry = applyHistoryAction(
              editor,
              tx,
              direction,
              getEditorUpdateRoot(editor),
              request
            );
          });
        } catch (error) {
          PREPARED_HISTORY_REPLAYS.delete(request);
          const conflicts = getAuthoredHistoryConflicts(editor, error);

          if (conflicts) {
            return Object.freeze({
              conflicts: Object.freeze([...conflicts]),
              status: 'blocked',
            });
          }
          throw error;
        }

        if (!hasEntry) return EMPTY_HISTORY_RESULT;

        const receipt = PREPARED_HISTORY_REPLAYS.get(request);
        PREPARED_HISTORY_REPLAYS.delete(request);
        if (!receipt) {
          throw new Error('History replay completed without a receipt.');
        }
        const result = Object.freeze({
          status: 'applied',
        }) satisfies HistoryResult;

        recordEditorHistoryReplayReceipt(result, receipt);
        return result;
      };

      return {
        redo: () => replay('redo'),
        undo: () => replay('undo'),
      } satisfies HistoryApi;
    },
    enabled: options.enabled as TEnabled,
    read({ editor }) {
      return Object.assign(() => getHistory(editor), {
        hasRedo: () =>
          withPublishedHistoryState(
            editor,
            () => peekHistoryEntry(editor, 'redos') !== undefined
          ),
        hasUndo: () =>
          withPublishedHistoryState(
            editor,
            () => peekHistoryEntry(editor, 'undos') !== undefined
          ),
      }) satisfies HistoryStateApi;
    },
    update({ editor, tx }) {
      return {
        merge: createHistoryControl(tx, 'merge'),
        newBatch: createHistoryControl(tx, 'push'),
        restore(value) {
          if (!History.isHistory(value)) {
            throw new Error('tx.history.restore requires decoded history.');
          }

          tx.tags.add('history-skip');
          tx.tags.add('history-restore');
          tx.annotations.set(historyRestore, encodeHistoryValue(editor, value));
        },
        skip: createHistoryControl(tx, 'skip'),
      } satisfies HistoryTxApi;
    },
    activate(context) {
      const { editor } = context;
      const previousActivation = HISTORY_ACTIVATION.get(editor);
      const previousPendingSchemaActivation =
        PENDING_HISTORY_SCHEMA_ACTIVATION.get(editor);
      const previousAutomaticGroupTime =
        LAST_AUTOMATIC_HISTORY_GROUP_TIME.get(editor);
      const previousState = captureHistoryState(editor);
      const activation = {};
      const configured = withHistoryStateDraft(editor, previousState, () =>
        configureHistoryState(
          editor,
          getHistoryMaxDepth(options),
          context.schema.identity()
        )
      );
      const activationState = configured.state;
      let activationPublished = false;

      HISTORY_ACTIVATION.set(editor, activation);
      LAST_AUTOMATIC_HISTORY_GROUP_TIME.delete(editor);
      context.onCleanup(
        registerEditorHistoryRuntime(editor, {
          head: (direction) =>
            peekHistoryEntry(editor, direction === 'undo' ? 'undos' : 'redos')
              ?.identity ?? null,
        })
      );
      context.onCleanup(
        registerEditorTransactionGuard(editor, ({ after, commit, schema }) => {
          if (HISTORY_ACTIVATION.get(editor) !== activation) return undefined;

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
          try {
            const prepared = withHistoryStateDraft(
              editor,
              activationPublished
                ? captureHistoryState(editor)
                : activationState,
              () => reduceHistory({ after, commit, editor, schema })
            );
            nextReplay = prepared.result;
            next = prepared.state;
            nextTime = LAST_AUTOMATIC_HISTORY_GROUP_TIME.get(editor);
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
          };
        })
      );
      context.onCleanup(({ reason }) => {
        if (PENDING_HISTORY_SCHEMA_ACTIVATION.get(editor) === activation) {
          PENDING_HISTORY_SCHEMA_ACTIVATION.delete(editor);
        }
        if (HISTORY_ACTIVATION.get(editor) !== activation) return;

        if (reason === 'rollback') {
          restoreHistoryState(editor, previousState);
          if (previousActivation) {
            HISTORY_ACTIVATION.set(editor, previousActivation);
          } else {
            HISTORY_ACTIVATION.delete(editor);
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
        HISTORY_ACTIVATION.delete(editor);
      });
      if (configured.result) {
        PENDING_HISTORY_SCHEMA_ACTIVATION.set(editor, activation);
      }
      context.afterPublish(() => {
        if (
          !activationPublished &&
          HISTORY_ACTIVATION.get(editor) === activation
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
