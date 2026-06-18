import type { Editor, Operation } from '@platejs/slate';

import { areJsonLikeValuesEqual } from './json-equality';
import { isRecord } from './record';

type HistoryBatchLike = {
  operations?: Operation[];
  statePatches?: readonly unknown[];
};

type HistoryLike = {
  redos?: HistoryBatchLike[];
  undos?: HistoryBatchLike[];
};

type HistoryStateView = {
  history?: {
    redos?: () => HistoryBatchLike[];
    undos?: () => HistoryBatchLike[];
  };
};

const isHistoryState = (value: unknown): value is HistoryStateView =>
  isRecord(value) &&
  (value.history === undefined ||
    (isRecord(value.history) &&
      (value.history.redos === undefined ||
        typeof value.history.redos === 'function') &&
      (value.history.undos === undefined ||
        typeof value.history.undos === 'function')));

const operationsEqual = (
  left: Operation,
  right: Operation | undefined
): boolean => right !== undefined && areJsonLikeValuesEqual(left, right);

const isEmptyHistoryBatch = (batch: HistoryBatchLike): boolean =>
  batch.operations?.length === 0 && (batch.statePatches?.length ?? 0) === 0;

const getHistoryBatchOperationSuffixStart = (
  batchOperations: readonly Operation[],
  operations: readonly Operation[]
): number | null => {
  if (batchOperations.length < operations.length) {
    return null;
  }

  const start = batchOperations.length - operations.length;

  let index = 0;

  while (index < operations.length) {
    const operation = operations[index];

    if (
      operation === undefined ||
      !operationsEqual(operation, batchOperations[start + index])
    ) {
      return null;
    }
    index++;
  }

  return start;
};

const readEditorHistory = (editor: Editor): HistoryLike | null =>
  editor.read((state) => {
    const history = isHistoryState(state) ? state.history : undefined;

    if (history === undefined) {
      return null;
    }

    return {
      redos: history.redos?.(),
      undos: history.undos?.(),
    };
  });

const removeOperationsFromHistoryStack = (
  stack: HistoryBatchLike[] | undefined,
  operations: readonly Operation[]
): void => {
  if (stack === undefined || operations.length === 0) {
    return;
  }

  let batchIndex = stack.length - 1;

  while (batchIndex >= 0) {
    const batch = stack[batchIndex];
    const batchOperations = batch?.operations;

    if (batch === undefined || batchOperations === undefined) {
      batchIndex--;
      continue;
    }

    if (!Array.isArray(batchOperations)) {
      throw new Error('Cannot remove rejected Yjs operations from history.');
    }

    const start = getHistoryBatchOperationSuffixStart(
      batchOperations,
      operations
    );

    if (start !== null) {
      batchOperations.splice(start, operations.length);

      if (isEmptyHistoryBatch(batch)) {
        stack.splice(batchIndex, 1);
      }

      return;
    }
    batchIndex--;
  }
};

export const removeRejectedYjsOperationsFromHistory = (
  editor: Editor,
  operations: readonly Operation[]
): void => {
  if (operations.length === 0) {
    return;
  }

  const history = readEditorHistory(editor);

  if (history === null) {
    return;
  }

  removeOperationsFromHistoryStack(history.undos, operations);
  removeOperationsFromHistoryStack(history.redos, operations);
};

export const removeRejectedYjsOperationsFromHistoryAfterCommit = (
  editor: Editor,
  operations: readonly Operation[]
): void => {
  if (operations.length === 0) {
    return;
  }

  const remove = (): void => {
    removeRejectedYjsOperationsFromHistory(editor, operations);
  };

  if (typeof queueMicrotask === 'function') {
    queueMicrotask(remove);
  } else {
    void Promise.resolve().then(remove);
  }
};
