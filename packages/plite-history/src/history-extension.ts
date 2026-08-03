import {
  defineExtension,
  defineCommand,
  defineUpdateAnnotation,
  type DocumentChange,
  type Editor,
  type EditorCommit,
  type EditorDocumentValue,
  type EditorEffect,
  type EditorExtension,
  type EditorExtensionTypeProvider,
  type EditorStateView,
  type EditorUpdateTransaction,
  type Selection,
  SelectionApi,
  type TextSelection,
  txOnly,
  type TxOnlyMethod,
  type Value,
  invertEffect,
} from '@platejs/plite';
import {
  dispatchCommand,
  getEditorUpdateRoot,
  MAIN_ROOT_KEY,
} from '@platejs/plite/internal';

import { type Batch, History, type HistoryJSON } from './history';
import { decodeHistoryValue, encodeHistoryValue } from './history-codec';
import {
  createHistoryBatchGroup,
  type HistoryBatchGroup,
  isSameHistoryPath,
  mergeHistoryBatchGroups,
  shouldMergeBatch,
  shouldMergeExplicitBatch,
} from './history-merge-policy';
import {
  cloneRange,
  getRangeRoot,
  restoreHistoricSelection,
  shouldPreserveHistoricDOMSelection,
  shouldRestoreHistoricSelection,
} from './history-selection';
import {
  captureHistoryState,
  clearHistoryStack,
  clearHistoryState,
  completeHistoryAction,
  configureHistoryState,
  getHistory,
  peekHistoryBatch,
  peekHistoryEntry,
  queueHistoryMapping,
  replaceHistoryHead,
  replaceHistoryState,
  restoreHistoryState,
  synchronizeHistorySchema,
  writeHistory,
} from './history-state';

export type HistoryStateApi<V extends Value = Value> = (() => History<V>) & {
  /** Read the redo stack. */
  redos: () => readonly Batch<V>[];
  /** Read the undo stack. */
  undos: () => readonly Batch<V>[];
};

export type HistoryControlTx = TxOnlyMethod<() => void>;

export type HistoryTxApi<V extends Value = Value> = {
  /** Permanently discard the redo branch without changing the document. */
  discardRedo: () => void;
  /** Merge this transaction into the previous compatible undo batch. */
  merge: HistoryControlTx;
  /** Make this transaction start a fresh undo batch. */
  newBatch: HistoryControlTx;
  /** Redo the next history batch inside the current transaction. */
  redo: () => void;
  /** Replace both history branches when the surrounding transaction commits. */
  restore: (history: History<V>) => void;
  /** Do not save this transaction to history. */
  skip: HistoryControlTx;
  /** Undo the previous history batch inside the current transaction. */
  undo: () => void;
};

export type HistoryOptions<TEnabled extends boolean | undefined = undefined> = {
  /** Disable history for an editor that installs history through a preset. */
  enabled?: TEnabled;
  /** Maximum number of undo and redo batches retained per branch. */
  maxDepth?: number;
  /** Idle time in milliseconds before an automatic edit starts a new batch. */
  newBatchDelay?: number;
};

export type HistoryExtensionTypes<V extends Value = Value> = {
  read: {
    history: HistoryStateApi<V>;
  };
  update: {
    history: HistoryTxApi<V>;
  };
};

type HistoryExtensionDefinition<TEnabled extends boolean | undefined> = {
  activate: true;
  enabled: TEnabled;
  name: 'history';
  on: true;
  read: HistoryStateApi;
  update: HistoryTxApi;
  validate: true;
};

/** Value-sensitive history capability provider for extension composition. */
export type HistoryExtensionTypeProvider =
  EditorExtensionTypeProvider<HistoryExtensionTypeProvider.Contract>;

// biome-ignore lint/style/noNamespace: declaration merging keeps the HKT contract nameable through package declarations without exporting a second root symbol
export declare namespace HistoryExtensionTypeProvider {
  interface Contract {
    readonly input: Value;
    readonly output: HistoryExtensionTypes<this['input']>;
  }
}

export type HistoryExtension<TEnabled extends boolean | undefined = undefined> =
  EditorExtension<HistoryExtensionDefinition<TEnabled>> &
    HistoryExtensionTypeProvider;

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

const historyDiscardRedo = defineUpdateAnnotation<boolean>({
  combine: (previous, next) => previous || next,
  key: 'history.discard-redo',
});

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
  tx.changes.apply(batch.change);
  for (const effect of batch.effects) {
    tx.effects.emit(effect.type, effect.value);
  }
  if (
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
  state: EditorStateView<V> & { history: HistoryStateApi<V> },
  tx: HistoryTransaction<V>,
  direction: HistoryAction,
  root: string
) => {
  const history = state.history();
  const batch =
    direction === 'undo' ? history.undos.at(-1) : history.redos.at(-1);

  if (!batch) return;

  runHistoricUpdate(root, tx, batch, () => {
    consumeHistoryBatch(tx, batch, direction, root);
  });
  tx.annotations.set(historyAction, direction);
};

type HistoryRedoCommand = {
  root: string;
};

type HistoryUndoCommand = {
  root: string;
};

type HistoryEditor = Editor<Value, readonly [HistoryExtension]>;

const historyRedoCommand = defineCommand<HistoryRedoCommand, HistoryEditor>(
  'history.redo',
  {
    build: ({ input, state }) =>
      state.transaction((tx) =>
        applyHistoryAction(state, tx, 'redo', input.root)
      ),
  }
);

const historyUndoCommand = defineCommand<HistoryUndoCommand, HistoryEditor>(
  'history.undo',
  {
    build: ({ input, state }) =>
      state.transaction((tx) =>
        applyHistoryAction(state, tx, 'undo', input.root)
      ),
  }
);

const createCollapsedRangeAtTextInsert = (
  group: Extract<HistoryBatchGroup, { kind: 'text' }>,
  offset: number,
  template: Selection
): TextSelection => {
  const afterPoint = group.afterPoint!;
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

const prepareHistoryBatch = <V extends Value>(
  action: DocumentChange,
  commit: EditorCommit<V>,
  effects: readonly EditorEffect[]
): Readonly<{
  batch: Batch<V>;
  group: HistoryBatchGroup | null;
}> | null => {
  const group = createHistoryBatchGroup(commit);
  const getSelectionRoot = (selection: Selection, fallback?: string) => {
    if (!selection) return;

    const root = getRangeRoot(selection) ?? fallback;

    return root === MAIN_ROOT_KEY ? undefined : root;
  };
  let batchSelectionBefore = cloneRange(commit.selectionBefore);
  let batchSelectionBeforeRoot = getSelectionRoot(
    batchSelectionBefore,
    commit.selectionBeforeRoot
  );
  const batchSelectionAfterRoot = getSelectionRoot(
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
      selectionAfter: cloneRange(commit.selectionAfter),
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
  !commit.changed.hasAny('replace') &&
  (!commit.changes.empty || effects.length > 0);

const createHistoryExtension = <
  const TEnabled extends boolean | undefined = undefined,
>(
  options: HistoryOptions<TEnabled> = {}
): HistoryExtension<TEnabled> =>
  defineExtension('history', {
    enabled: options.enabled as TEnabled,
    read({ editor }) {
      return Object.assign(() => getHistory(editor), {
        redos: () => getHistory(editor).redos,
        undos: () => getHistory(editor).undos,
      }) satisfies HistoryStateApi;
    },
    update({ editor, tx }) {
      return {
        discardRedo() {
          tx.annotations.set(historyDiscardRedo, true);
        },
        merge: createHistoryControl(tx, 'merge'),
        newBatch: createHistoryControl(tx, 'push'),
        redo() {
          dispatchCommand(editor, historyRedoCommand, {
            root: getEditorUpdateRoot(editor),
          });
        },
        restore(value) {
          if (!History.isHistory(value)) {
            throw new Error('tx.history.restore requires decoded history.');
          }

          tx.tags.add('history-skip');
          tx.tags.add('history-restore');
          tx.annotations.set(historyRestore, encodeHistoryValue(editor, value));
        },
        skip: createHistoryControl(tx, 'skip'),
        undo() {
          dispatchCommand(editor, historyUndoCommand, {
            root: getEditorUpdateRoot(editor),
          });
        },
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

      HISTORY_ACTIVATION.set(editor, activation);
      LAST_AUTOMATIC_HISTORY_GROUP_TIME.delete(editor);
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
      if (configureHistoryState(editor, getHistoryMaxDepth(options))) {
        PENDING_HISTORY_SCHEMA_ACTIVATION.set(editor, activation);
        context.afterPublish(() => {
          if (PENDING_HISTORY_SCHEMA_ACTIVATION.get(editor) === activation) {
            PENDING_HISTORY_SCHEMA_ACTIVATION.delete(editor);
          }
        });
      }
    },
    on: {
      commit({ commit, editor }) {
        if (
          synchronizeHistorySchema(editor) ||
          PENDING_HISTORY_SCHEMA_ACTIVATION.has(editor)
        ) {
          LAST_AUTOMATIC_HISTORY_GROUP_TIME.delete(editor);
          return;
        }

        const changes = commit.changes;
        const inverseChanges = commit.inverseChanges;

        const effects = commit.effects.filter(
          (effect) => effect.type.history === 'push'
        );
        const action = commit.annotations[historyAction.key] as
          | HistoryAction
          | undefined;
        const discardRedos = Boolean(
          commit.annotations[historyDiscardRedo.key]
        );
        const restoredHistoryJSON = commit.annotations[historyRestore.key] as
          | HistoryJSON
          | undefined;

        if (restoredHistoryJSON) {
          replaceHistoryState(
            editor,
            decodeHistoryValue(editor, restoredHistoryJSON, {
              validateDocument: false,
            })
          );
          LAST_AUTOMATIC_HISTORY_GROUP_TIME.delete(editor);
        }

        if (action) {
          LAST_AUTOMATIC_HISTORY_GROUP_TIME.delete(editor);
          const source = action === 'undo' ? 'undos' : 'redos';
          const destination = action === 'undo' ? 'redos' : 'undos';
          const batch = peekHistoryBatch(editor, source);

          if (!batch) {
            throw new Error(`Missing history batch for ${action}.`);
          }

          completeHistoryAction(
            editor,
            source,
            destination,
            {
              ...batch,
              change: commit.inverseChanges,
              effects: commit.effects.toReversed().map(invertEffect),
            },
            discardRedos
          );
          return;
        }

        if (!shouldSaveCommit(commit, effects)) {
          LAST_AUTOMATIC_HISTORY_GROUP_TIME.delete(editor);
          if (discardRedos) clearHistoryStack(editor, 'redos');

          if (!commit.tags.includes('historic') && !changes.empty) {
            const after = editor.read.value();
            const before = inverseChanges.apply(toChangeValue(after));

            queueHistoryMapping(editor, changes, before);
          }
          return;
        }

        const prepared = prepareHistoryBatch(inverseChanges, commit, effects);

        if (!prepared) return;

        const preparedBatch = prepared.batch;
        const lastEntry = peekHistoryEntry(editor, 'undos');
        const currentTime = globalThis.performance.now();
        const previousAutomaticGroupTime =
          LAST_AUTOMATIC_HISTORY_GROUP_TIME.get(editor);
        const explicitMerge = commit.tags.includes('history-merge');
        const explicitPush = commit.tags.includes('history-push');
        const merge =
          lastEntry != null &&
          !explicitPush &&
          (explicitMerge
            ? shouldMergeExplicitBatch(
                preparedBatch,
                prepared.group,
                lastEntry.batch,
                lastEntry.group,
                commit.tags.includes('native-text-input')
              )
            : previousAutomaticGroupTime !== undefined &&
              currentTime - previousAutomaticGroupTime <=
                getHistoryNewBatchDelay(options) &&
              preparedBatch.effects.length === 0 &&
              shouldMergeBatch(
                preparedBatch,
                prepared.group,
                lastEntry.batch,
                lastEntry.group
              ));

        if (lastEntry && merge) {
          const { selectionAfterRoot: _selectionAfterRoot, ...previousBatch } =
            lastEntry.batch;
          const mergedBatch = {
            ...previousBatch,
            change: preparedBatch.change.compose(
              lastEntry.batch.change,
              toChangeValue(editor.read.value())
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

          replaceHistoryHead(editor, 'undos', mergedBatch, {
            clearRedos: true,
            group: mergedGroup,
          });
        } else {
          writeHistory(editor, 'undos', preparedBatch, {
            clearRedos: true,
            group: prepared.group,
          });
        }
        if (explicitPush || preparedBatch.effects.length > 0) {
          LAST_AUTOMATIC_HISTORY_GROUP_TIME.delete(editor);
        } else {
          LAST_AUTOMATIC_HISTORY_GROUP_TIME.set(editor, currentTime);
        }
      },
    },
    validate() {
      getHistoryMaxDepth(options);
      getHistoryNewBatchDelay(options);
    },
  }) as HistoryExtension<TEnabled>;

/** Create the inverse-change history extension. */
export const history = <const TEnabled extends boolean | undefined = undefined>(
  options: HistoryOptions<TEnabled> = {}
): HistoryExtension<TEnabled> =>
  createHistoryExtension(options) as HistoryExtension<TEnabled>;
