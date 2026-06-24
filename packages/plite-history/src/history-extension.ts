import {
  defineEditorExtension,
  type Editor,
  type EditorCommit,
  type EditorExtensionSetupContext,
  type EditorStatePatch,
  type EditorUpdateTransaction,
  type Operation,
  OperationApi,
  type Path,
  PathApi,
  PointApi,
  type Range,
  RangeApi,
  type Value,
} from '@platejs/plite';
import {
  applyStatePatches,
  executeCommand,
  getEditorOperationRoot,
  getEditorSelectionRoot,
  getOperationRoot,
  MAIN_ROOT_KEY,
  shouldSaveStatePatch,
} from '@platejs/plite/internal';

import type { Batch, History } from './history';
import {
  shouldMergeBatch,
  shouldMergeExplicitBatch,
  shouldSaveBatch,
  shouldSaveHistoryOperation,
} from './history-merge-policy';
import { replayHistoricOperations } from './history-replay';
import {
  applySelectionPatch,
  clonePoint,
  cloneRange,
  filterHistoricSelectionOperations,
  filterHistoricUndoOperations,
  getRangeRoot,
  restoreHistoricSelection,
  shouldPreserveHistoricDOMSelection,
  shouldRestoreHistoricSelection,
} from './history-selection';
import {
  clearHistoryState,
  getHistory,
  isMerging,
  isSaving,
  isSplittingOnce,
  setSplittingOnce,
  withMerging,
  withNewBatch,
  withoutMerging,
  withoutSaving,
  writeHistory,
} from './history-state';

export type HistoryStateApi<V extends Value = Value> = {
  /** Read the complete undo/redo history object. */
  get: () => History<V>;
  /** Read the redo stack. */
  redos: () => readonly Batch<V>[];
  /** Read the undo stack. */
  undos: () => readonly Batch<V>[];
};

export type HistoryTxApi = {
  /** Redo the next history batch inside the current transaction. */
  redo: () => void;
  /** Undo the previous history batch inside the current transaction. */
  undo: () => void;
};

export type HistoryControlApi = {
  /** Read whether new operations are currently merging into a previous batch. */
  isMerging: () => boolean | undefined;
  /** Read whether new operations are currently saved to history. */
  isSaving: () => boolean | undefined;
  /** Run updates that merge into the previous history batch. */
  withMerging: (fn: () => void) => void;
  /** Run updates whose first operation starts a fresh history batch. */
  withNewBatch: (fn: () => void) => void;
  /** Run updates that do not merge into the previous history batch. */
  withoutMerging: (fn: () => void) => void;
  /** Run updates without saving operations or state patches to history. */
  withoutSaving: (fn: () => void) => void;
};

export type HistoryOptions<TEnabled extends boolean | undefined = undefined> = {
  /** Disable history for an editor that installs history through a preset. */
  enabled?: TEnabled;
};

declare module '@platejs/plite' {
  interface EditorStateExtensionGroups<V extends Value = Value> {
    history: HistoryStateApi<V>;
  }

  interface EditorTxExtensionGroups<V extends Value = Value> {
    history: HistoryTxApi;
  }
}

const runHistoricUpdate = <V extends Value>(
  editor: Editor<V>,
  batch: Batch<V>,
  fn: (tx: EditorUpdateTransaction<V>) => void
) => {
  const stateOnly =
    batch.operations.length === 0 && batch.statePatches.length > 0;
  const preserveSelection =
    stateOnly || shouldPreserveHistoricDOMSelection(editor, batch);

  editor.update(fn, {
    metadata: {
      history: { mode: 'skip' },
      ...(preserveSelection
        ? {
            selection: {
              dom: 'preserve',
              focus: false,
              scroll: false,
            },
          }
        : {}),
    },
    skipNormalize: true,
    tag: 'historic',
  });
};

const applyRedo = <V extends Value>(editor: Editor<V>) => {
  const history = getHistory(editor);
  const batch = history.redos.at(-1);

  if (!batch) {
    return;
  }
  const root = getEditorOperationRoot(editor);

  runHistoricUpdate(editor, batch, (tx) => {
    const operations = filterHistoricSelectionOperations(
      batch.operations,
      root
    );

    if (shouldRestoreHistoricSelection(root, batch)) {
      restoreHistoricSelection(tx, batch, root);
    }
    applyStatePatches(editor, batch.statePatches, 'redo');
    replayHistoricOperations(editor, operations);
  });

  history.redos.pop();
  writeHistory(editor, 'undos', batch);
};

const applyUndo = <V extends Value>(editor: Editor<V>) => {
  const history = getHistory(editor);
  const batch = history.undos.at(-1);

  if (!batch) {
    return;
  }
  const root = getEditorOperationRoot(editor);

  runHistoricUpdate(editor, batch, (tx) => {
    const inverseOps = batch.operations.map(OperationApi.inverse).reverse();
    const operations = filterHistoricUndoOperations(inverseOps, root);

    applyStatePatches(editor, batch.statePatches, 'undo');
    replayHistoricOperations(editor, operations);
    if (shouldRestoreHistoricSelection(root, batch)) {
      restoreHistoricSelection(tx, batch, root);
    }
  });

  writeHistory(editor, 'redos', batch);
  history.undos.pop();
};

/**
 * Create the undo/redo history extension.
 */
export const history = <const TEnabled extends boolean | undefined = undefined>(
  options: HistoryOptions<TEnabled> = {}
) => {
  const extension = {
    enabled: options.enabled as TEnabled,
    name: 'history',
    options,
    state: {
      history(_state: unknown, editor: Editor) {
        return {
          get: () => getHistory(editor),
          redos: () => getHistory(editor).redos,
          undos: () => getHistory(editor).undos,
        };
      },
    },
    tx: {
      history(_tx: unknown, editor: Editor) {
        return {
          redo() {
            executeCommand(editor, { type: 'history_redo' }, () => {
              applyRedo(editor);
              return true;
            });
          },
          undo() {
            executeCommand(editor, { type: 'history_undo' }, () => {
              applyUndo(editor);
              return true;
            });
          },
        };
      },
    },
    setup(context: EditorExtensionSetupContext<Editor>) {
      const editor = context.editor;

      getHistory(editor);

      return {
        api: {
          history: {
            isMerging: () => isMerging(editor),
            isSaving: () => isSaving(editor),
            withMerging: (fn: () => void) => withMerging(editor, fn),
            withNewBatch: (fn: () => void) => withNewBatch(editor, fn),
            withoutMerging: (fn: () => void) => withoutMerging(editor, fn),
            withoutSaving: (fn: () => void) => withoutSaving(editor, fn),
          },
        },
        cleanup() {
          clearHistoryState(editor);
        },
        onCommit({ commit: change }: { commit: EditorCommit }) {
          const committedOps = [...(change?.operations ?? [])];
          const committedStatePatches = [
            ...(change?.statePatches ?? []),
          ].filter((patch) => shouldSaveStatePatch(editor, patch));

          if (committedOps.length === 0 && committedStatePatches.length === 0) {
            return;
          }

          const history = getHistory(editor);
          const { undos } = history;
          const lastBatch = undos.at(-1);
          let save = isSaving(editor);
          let merge = isMerging(editor);

          if (save == null) {
            save = shouldSaveCommit(
              change,
              committedOps,
              committedStatePatches
            );
          }

          if (!save && shouldRebaseHistory(change, committedOps)) {
            rebaseHistory(history.undos, committedOps);
            rebaseHistory(history.redos, committedOps);
          }

          if (save) {
            const preparedBatch = prepareHistoryBatch(
              change?.selectionBefore ?? null,
              getEditorSelectionRoot(editor),
              committedOps,
              committedStatePatches,
              change.metadata
            );

            if (!preparedBatch) {
              return;
            }

            if (merge == null) {
              if (lastBatch == null) {
                merge = false;
              } else if (change?.metadata.history?.mode === 'push') {
                merge = false;
              } else if (change?.metadata.history?.mode === 'merge') {
                merge = shouldMergeExplicitBatch(
                  preparedBatch.operations,
                  lastBatch,
                  change.metadata
                );
              } else if (change?.tags.includes('history-push')) {
                merge = false;
              } else if (change?.tags.includes('history-merge')) {
                merge = true;
              } else if (preparedBatch.statePatches.length > 0) {
                merge = false;
              } else {
                merge = shouldMergeBatch(preparedBatch.operations, lastBatch);
              }
            }

            if (isSplittingOnce(editor)) {
              merge = false;
              setSplittingOnce(editor, undefined);
            }

            if (lastBatch && merge) {
              lastBatch.operations.push(...preparedBatch.operations);
              appendStatePatches(
                lastBatch.statePatches,
                preparedBatch.statePatches
              );
            } else {
              writeHistory(editor, 'undos', preparedBatch);
            }

            while (undos.length > 100) {
              undos.shift();
            }

            history.redos = [];
          }
        },
      };
    },
  } as const;

  return defineEditorExtension(extension);
};

const isSameOperationRoot = (operation: Operation, applied: Operation) =>
  getOperationRoot(operation) === getOperationRoot(applied);

const cloneStatePatches = (
  statePatches: readonly EditorStatePatch[]
): EditorStatePatch[] => statePatches.map((patch) => structuredClone(patch));

const isFullStatePatch = (
  patch: EditorStatePatch
): patch is EditorStatePatch & { value: unknown } =>
  Object.hasOwn(patch, 'value');

const appendStatePatches = (
  target: EditorStatePatch[],
  statePatches: readonly EditorStatePatch[]
) => {
  for (const patch of statePatches) {
    const existingPatch = target.find(({ key }) => key === patch.key);

    if (
      existingPatch &&
      isFullStatePatch(existingPatch) &&
      isFullStatePatch(patch)
    ) {
      existingPatch.value = structuredClone(patch.value);
    } else {
      target.push(structuredClone(patch));
    }
  }
};

const getCollapsedRangePoint = (range: Range | null) =>
  range && RangeApi.isCollapsed(range) ? range.anchor : null;

const getPointRoot = (
  point: Range['anchor'],
  fallbackRoot: string | undefined
): string => point.root ?? fallbackRoot ?? MAIN_ROOT_KEY;

const isPointOnTextInsert = <V extends Value>(
  point: Range['anchor'],
  root: string | undefined,
  operation: Extract<Operation<V>, { type: 'insert_text' }>
) =>
  getPointRoot(point, root) === getOperationRoot(operation) &&
  PathApi.equals(point.path, operation.path);

const createCollapsedRangeAtTextInsert = <V extends Value>(
  operation: Extract<Operation<V>, { type: 'insert_text' }>
): Range => {
  const root = getOperationRoot(operation);
  const point = {
    offset: operation.offset,
    path: [...operation.path],
    ...(root === MAIN_ROOT_KEY ? {} : { root }),
  };

  return {
    anchor: point,
    focus: point,
  };
};

const selectionTracksTextBurstEnd = <V extends Value>({
  firstSaveableIndex,
  operations,
  selectionBefore,
  selectionBeforeRoot,
}: {
  firstSaveableIndex: number;
  operations: readonly Operation<V>[];
  selectionBefore: Range | null;
  selectionBeforeRoot: string | undefined;
}): boolean => {
  const firstSaveable = operations[firstSaveableIndex];

  if (firstSaveable?.type !== 'insert_text') {
    return false;
  }

  let currentSelection = transformRange(
    selectionBefore,
    firstSaveable,
    selectionBeforeRoot
  );
  let currentSelectionRoot = currentSelection
    ? (getRangeRoot(currentSelection) ?? selectionBeforeRoot)
    : undefined;

  for (const operation of operations.slice(firstSaveableIndex + 1)) {
    if (operation.type !== 'set_selection') {
      return false;
    }

    currentSelection = applySelectionPatch(
      currentSelection,
      operation.newProperties,
      operation.root
    );
    currentSelectionRoot = currentSelection
      ? (getRangeRoot(currentSelection) ??
        operation.root ??
        currentSelectionRoot)
      : undefined;
  }

  const point = getCollapsedRangePoint(currentSelection);

  return Boolean(
    point &&
      isPointOnTextInsert(point, currentSelectionRoot, firstSaveable) &&
      point.offset === firstSaveable.offset + firstSaveable.text.length
  );
};

const getTextBurstSelectionBefore = <V extends Value>({
  firstSaveableIndex,
  isNativeTextInput,
  operations,
  selectionBefore,
  selectionBeforeRoot,
}: {
  firstSaveableIndex: number;
  isNativeTextInput: boolean;
  operations: readonly Operation<V>[];
  selectionBefore: Range | null;
  selectionBeforeRoot: string | undefined;
}): { root: string | undefined; selection: Range } | null => {
  const firstSaveable = operations[firstSaveableIndex];

  if (firstSaveable?.type !== 'insert_text' || firstSaveable.text.length <= 1) {
    return null;
  }

  const insertRoot = getOperationRoot(firstSaveable);
  const insertStart = firstSaveable.offset;
  const insertEnd = insertStart + firstSaveable.text.length;
  const selectionPoint = getCollapsedRangePoint(selectionBefore);

  if (
    firstSaveableIndex === 0 &&
    isNativeTextInput &&
    selectionPoint &&
    isPointOnTextInsert(selectionPoint, selectionBeforeRoot, firstSaveable) &&
    selectionPoint.offset >= insertStart &&
    selectionPoint.offset <= insertEnd &&
    selectionTracksTextBurstEnd({
      firstSaveableIndex,
      operations,
      selectionBefore,
      selectionBeforeRoot,
    })
  ) {
    return {
      root: insertRoot,
      selection: createCollapsedRangeAtTextInsert(firstSaveable),
    };
  }

  if (firstSaveableIndex === 0) {
    return null;
  }

  if (!isNativeTextInput) {
    return null;
  }

  let currentSelection = cloneRange(selectionBefore);
  let currentSelectionRoot = selectionBeforeRoot;
  let previousOffset = insertStart;

  for (let index = 0; index < firstSaveableIndex; index++) {
    const operation = operations[index]!;

    if (operation.type !== 'set_selection') {
      return null;
    }

    currentSelection = applySelectionPatch(
      currentSelection,
      operation.newProperties,
      operation.root
    );
    currentSelectionRoot = currentSelection
      ? (getRangeRoot(currentSelection) ??
        operation.root ??
        currentSelectionRoot)
      : undefined;

    const point = getCollapsedRangePoint(currentSelection);
    const pointRoot = point
      ? (point.root ?? currentSelectionRoot ?? MAIN_ROOT_KEY)
      : undefined;

    if (
      !point ||
      pointRoot !== insertRoot ||
      !PathApi.equals(point.path, firstSaveable.path) ||
      point.offset < insertStart ||
      point.offset > insertEnd ||
      point.offset < previousOffset
    ) {
      return null;
    }

    previousOffset = point.offset;
  }

  if (
    !selectionTracksTextBurstEnd({
      firstSaveableIndex,
      operations,
      selectionBefore: currentSelection,
      selectionBeforeRoot: currentSelectionRoot,
    })
  ) {
    return null;
  }

  return {
    root: insertRoot,
    selection: createCollapsedRangeAtTextInsert(firstSaveable),
  };
};

const prepareHistoryBatch = <V extends Value>(
  selectionBefore: Range | null,
  selectionBeforeRoot: string | undefined,
  operations: readonly Operation<V>[],
  statePatches: readonly EditorStatePatch[],
  metadata: EditorCommit['metadata']
): Batch<V> | null => {
  const firstSaveableIndex = operations.findIndex(shouldSaveHistoryOperation);
  const getBatchSelectionBeforeRoot = (selection: Range | null) =>
    selection ? (getRangeRoot(selection) ?? selectionBeforeRoot) : undefined;
  const createBatch = (
    batchOperations: Operation<V>[],
    batchSelectionBefore: Range | null,
    batchSelectionBeforeRoot: string | undefined
  ): Batch<V> => {
    const batch: Batch<V> = {
      operations: batchOperations,
      selectionBefore: batchSelectionBefore,
      statePatches: cloneStatePatches(statePatches),
    };

    if (batchSelectionBeforeRoot !== undefined) {
      batch.selectionBeforeRoot = batchSelectionBeforeRoot;
    }

    return batch;
  };

  if (firstSaveableIndex === -1) {
    return statePatches.length === 0
      ? null
      : createBatch(
          [],
          cloneRange(selectionBefore),
          getBatchSelectionBeforeRoot(selectionBefore)
        );
  }

  let batchSelectionBefore = cloneRange(selectionBefore);
  let batchSelectionBeforeRoot =
    getBatchSelectionBeforeRoot(batchSelectionBefore);
  const textBurstSelectionBefore = getTextBurstSelectionBefore({
    firstSaveableIndex,
    isNativeTextInput: metadata.origin?.kind === 'native-text-input',
    operations,
    selectionBefore,
    selectionBeforeRoot,
  });

  if (textBurstSelectionBefore) {
    return createBatch(
      [...operations.slice(firstSaveableIndex)],
      textBurstSelectionBefore.selection,
      textBurstSelectionBefore.root
    );
  }

  for (let index = 0; index < firstSaveableIndex; index++) {
    const operation = operations[index]!;

    if (operation.type === 'set_selection') {
      batchSelectionBefore = applySelectionPatch(
        batchSelectionBefore,
        operation.newProperties,
        operation.root
      );
      batchSelectionBeforeRoot = batchSelectionBefore
        ? (getRangeRoot(batchSelectionBefore) ??
          operation.root ??
          batchSelectionBeforeRoot)
        : undefined;
    }
  }

  return createBatch(
    [...operations.slice(firstSaveableIndex)],
    batchSelectionBefore,
    batchSelectionBeforeRoot
  );
};

const shouldSaveCommit = (
  change: EditorCommit | undefined,
  operations: readonly Operation[],
  statePatches: readonly EditorStatePatch[]
): boolean => {
  if (change?.metadata.history?.mode === 'skip') {
    return false;
  }

  if (change?.metadata.collab?.saveToHistory === false) {
    return false;
  }

  if (
    change?.metadata.collab?.origin === 'remote' &&
    change.metadata.collab.saveToHistory !== true
  ) {
    return false;
  }

  if (change?.tags.includes('historic')) {
    return false;
  }

  return statePatches.length > 0 || shouldSaveBatch(operations);
};

const shouldRebaseHistory = (
  change: EditorCommit | undefined,
  operations: readonly Operation[]
): boolean => !change?.tags.includes('historic') && shouldSaveBatch(operations);

const transformSelectionPatch = (
  selection: Partial<Range> | null,
  operation: Operation,
  root?: string
): Partial<Range> | null => {
  if (selection == null) {
    return null;
  }

  const next = { ...selection };

  if (next.anchor) {
    const anchor = PointApi.transform(clonePoint(next.anchor, root), operation);

    if (!anchor) {
      return null;
    }

    next.anchor = anchor;
  }

  if (next.focus) {
    const focus = PointApi.transform(clonePoint(next.focus, root), operation);

    if (!focus) {
      return null;
    }

    next.focus = focus;
  }

  return next;
};

const transformRange = (
  range: Range | null,
  operation: Operation,
  root?: string
): Range | null =>
  range == null
    ? null
    : RangeApi.transform(cloneRange(range, root)!, operation);

const transformTextOperation = <V extends Value>(
  operation: Extract<Operation<V>, { type: 'insert_text' | 'remove_text' }>,
  applied: Operation
): Operation<V> | null => {
  if (!isSameOperationRoot(operation, applied)) {
    return operation;
  }

  let text = operation.text;

  if (
    operation.type === 'insert_text' &&
    applied.type === 'remove_text' &&
    PathApi.equals(operation.path, applied.path)
  ) {
    const operationStart = operation.offset;
    const operationEnd = operation.offset + operation.text.length;
    const appliedStart = applied.offset;
    const appliedEnd = applied.offset + applied.text.length;
    const overlapStart = Math.max(operationStart, appliedStart);
    const overlapEnd = Math.min(operationEnd, appliedEnd);

    if (overlapStart < overlapEnd) {
      text =
        operation.text.slice(0, overlapStart - operationStart) +
        operation.text.slice(overlapEnd - operationStart);

      if (text.length === 0) {
        return null;
      }
    }
  }

  const point = PointApi.transform(
    {
      path: operation.path,
      offset: operation.offset,
      root: getOperationRoot(operation),
    },
    applied
  );

  if (!point) {
    return null;
  }

  return {
    ...operation,
    path: point.path,
    offset: point.offset,
    text,
  } as Operation<V>;
};

const transformPathOperation = <V extends Value>(
  operation: Operation<V> & { path: Path },
  applied: Operation
): Operation<V> | null => {
  if (!isSameOperationRoot(operation, applied)) {
    return operation;
  }

  const path = PathApi.transform(operation.path, applied);

  if (!path) {
    return null;
  }

  return { ...operation, path } as Operation<V>;
};

const transformChildIndex = (
  originalPath: Path,
  path: Path,
  index: number,
  applied: Operation
): number | null => {
  const indexedPath = originalPath.concat(index);
  const nextPath = PathApi.transform(indexedPath, applied);

  if (!nextPath) {
    return null;
  }

  for (let i = 0; i < path.length; i++) {
    if (nextPath[i] !== path[i]) {
      return null;
    }
  }

  return nextPath[path.length] ?? index;
};

const transformOperation = <V extends Value>(
  operation: Operation<V>,
  applied: Operation
): Operation<V> | null => {
  if (!isSameOperationRoot(operation, applied)) {
    return operation;
  }

  switch (operation.type) {
    case 'insert_text':
    case 'remove_text':
      return transformTextOperation(operation, applied);

    case 'insert_node':
    case 'remove_node':
    case 'set_node':
      return transformPathOperation(operation, applied);

    case 'merge_node':
    case 'split_node': {
      const next = transformPathOperation(operation, applied);

      if (!next) {
        return null;
      }

      if (applied.type !== 'insert_text' && applied.type !== 'remove_text') {
        return next;
      }

      const point = PointApi.transform(
        {
          path: operation.path,
          offset: operation.position,
          root: getOperationRoot(operation),
        },
        applied
      );

      if (!point) {
        return null;
      }

      return { ...next, position: point.offset } as Operation<V>;
    }

    case 'move_node': {
      const path = PathApi.transform(operation.path, applied);
      const newPath = PathApi.transform(operation.newPath, applied);

      if (!path || !newPath) {
        return null;
      }

      return { ...operation, path, newPath };
    }

    case 'replace_fragment': {
      const path = PathApi.transform(operation.path, applied);

      if (!path) {
        return null;
      }

      return {
        ...operation,
        path,
        selection: transformRange(
          operation.selection,
          applied,
          getOperationRoot(operation)
        ),
        newSelection: transformRange(
          operation.newSelection,
          applied,
          getOperationRoot(operation)
        ),
      };
    }

    case 'replace_children': {
      const path = PathApi.transform(operation.path, applied);

      if (!path) {
        return null;
      }

      const index = transformChildIndex(
        operation.path,
        path,
        operation.index,
        applied
      );

      if (index == null) {
        return null;
      }

      return {
        ...operation,
        index,
        newSelection: transformRange(
          operation.newSelection,
          applied,
          getOperationRoot(operation)
        ),
        path,
        selection: transformRange(
          operation.selection,
          applied,
          getOperationRoot(operation)
        ),
      };
    }

    case 'set_selection':
      return {
        ...operation,
        newProperties: transformSelectionPatch(
          operation.newProperties,
          applied,
          getOperationRoot(operation)
        ),
        properties: transformSelectionPatch(
          operation.properties,
          applied,
          getOperationRoot(operation)
        ),
      } as Operation<V>;

    default:
      return operation;
  }
};

const rebaseBatch = <V extends Value>(
  batch: Batch<V>,
  appliedOperations: readonly Operation[]
): Batch<V> | null => {
  let operations = batch.operations;
  let selectionBefore = batch.selectionBefore;
  let selectionBeforeRoot = batch.selectionBeforeRoot;

  for (const appliedOperation of appliedOperations) {
    operations = operations
      .map((operation) => transformOperation(operation, appliedOperation))
      .filter((operation): operation is Operation<V> => Boolean(operation));
    selectionBefore = transformRange(
      selectionBefore,
      appliedOperation,
      selectionBeforeRoot
    );
    if (!selectionBefore) {
      selectionBeforeRoot = undefined;
    }
  }

  if (operations.length === 0 && batch.statePatches.length === 0) {
    return null;
  }

  const { selectionBeforeRoot: _selectionBeforeRoot, ...batchBase } = batch;

  if (selectionBeforeRoot === undefined) {
    return {
      ...batchBase,
      operations,
      selectionBefore,
    };
  }

  return {
    ...batchBase,
    operations,
    selectionBefore,
    selectionBeforeRoot,
  };
};

const rebaseHistory = <V extends Value>(
  stack: Batch<V>[],
  appliedOperations: readonly Operation[]
) => {
  for (let index = stack.length - 1; index >= 0; index--) {
    const batch = rebaseBatch(stack[index]!, appliedOperations);

    if (batch) {
      stack[index] = batch;
    } else {
      stack.splice(index, 1);
    }
  }
};
