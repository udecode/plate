import {
  type EditorCommit,
  type Operation,
  PathApi,
  RangeApi,
} from '@platejs/slate';
import { getOperationRoot, MAIN_ROOT_KEY } from '@platejs/slate/internal';
import type { Batch } from './history';

const shouldMerge = (op: Operation, prev: Operation | undefined): boolean => {
  if (
    prev &&
    getOperationRoot(op) === getOperationRoot(prev) &&
    op.type === 'insert_text' &&
    prev.type === 'insert_text' &&
    op.offset === prev.offset + prev.text.length &&
    PathApi.equals(op.path, prev.path)
  ) {
    return true;
  }

  if (
    prev &&
    getOperationRoot(op) === getOperationRoot(prev) &&
    op.type === 'remove_text' &&
    prev.type === 'remove_text' &&
    op.offset + op.text.length === prev.offset &&
    PathApi.equals(op.path, prev.path)
  ) {
    return true;
  }

  return false;
};

const shouldMergeSelectedReplacementFollowup = (
  operation: Operation,
  previousBatch: Batch,
  previousSaveableOperations: readonly Operation[]
): boolean => {
  if (
    operation.type !== 'insert_text' ||
    previousBatch.statePatches.length > 0 ||
    !previousBatch.selectionBefore ||
    RangeApi.isCollapsed(previousBatch.selectionBefore)
  ) {
    return false;
  }

  const previousOperation = previousSaveableOperations.at(-1);

  if (
    previousOperation?.type !== 'insert_text' ||
    !shouldMerge(operation, previousOperation)
  ) {
    return false;
  }

  const previousRoot = getOperationRoot(previousOperation);
  const previousBatchSingleRoot = previousSaveableOperations.every(
    (previous) => getOperationRoot(previous) === previousRoot
  );
  const previousBatchDeletedSelection = previousSaveableOperations
    .slice(0, -1)
    .some(
      (previous) =>
        previous.type === 'remove_text' ||
        previous.type === 'remove_node' ||
        previous.type === 'merge_node'
    );

  return previousBatchSingleRoot && previousBatchDeletedSelection;
};

const shouldMergeSetNodeBatch = (
  operation: Operation,
  previousSaveableOperations: readonly Operation[]
): boolean => {
  if (operation.type !== 'set_node') {
    return false;
  }

  const previousRoot = getOperationRoot(operation);

  return (
    previousSaveableOperations.length > 0 &&
    previousSaveableOperations.every(
      (previous) =>
        previous.type === 'set_node' &&
        getOperationRoot(previous) === previousRoot &&
        PathApi.equals(previous.path, operation.path)
    )
  );
};

export const shouldSaveHistoryOperation = (op: Operation): boolean => {
  if (op.type === 'set_selection') {
    return false;
  }

  return true;
};

export const shouldMergeBatch = (
  operations: readonly Operation[],
  previousBatch: Batch
): boolean => {
  const saveableOperations = operations.filter(shouldSaveHistoryOperation);
  const previousSaveableOperations = previousBatch.operations.filter(
    shouldSaveHistoryOperation
  );
  const previousOperation = previousSaveableOperations.at(-1);
  const previousRoot = previousOperation
    ? getOperationRoot(previousOperation)
    : MAIN_ROOT_KEY;
  const previousBatchIsTextOnly =
    previousOperation != null &&
    previousSaveableOperations.every(
      (operation) =>
        operation.type === previousOperation.type &&
        getOperationRoot(operation) === previousRoot
    );
  const previousBatchIsSingleTextPath =
    previousOperation != null &&
    (previousOperation.type === 'insert_text' ||
      previousOperation.type === 'remove_text') &&
    previousSaveableOperations.every(
      (operation) =>
        (operation.type === 'insert_text' ||
          operation.type === 'remove_text') &&
        getOperationRoot(operation) === previousRoot &&
        PathApi.equals(operation.path, previousOperation.path)
    );

  return saveableOperations.length === 1
    ? shouldMergeSelectedReplacementFollowup(
        saveableOperations[0]!,
        previousBatch,
        previousSaveableOperations
      ) ||
        shouldMergeSetNodeBatch(
          saveableOperations[0]!,
          previousSaveableOperations
        ) ||
        ((previousBatchIsTextOnly || previousBatchIsSingleTextPath) &&
          shouldMerge(saveableOperations[0]!, previousOperation))
    : false;
};

export const shouldMergeExplicitBatch = (
  operations: readonly Operation[],
  previousBatch: Batch,
  metadata: EditorCommit['metadata']
): boolean => {
  if (shouldMergeBatch(operations, previousBatch)) {
    return true;
  }

  const saveableOperations = operations.filter(shouldSaveHistoryOperation);
  const previousSaveableOperations = previousBatch.operations.filter(
    shouldSaveHistoryOperation
  );

  if (
    saveableOperations.length === 0 ||
    previousSaveableOperations.length === 0 ||
    previousBatch.statePatches.length > 0
  ) {
    return false;
  }

  const allSaveableOperations = [
    ...previousSaveableOperations,
    ...saveableOperations,
  ];
  const firstOperation = allSaveableOperations[0]!;
  const root = getOperationRoot(firstOperation);
  const allOperationsShareRoot = allSaveableOperations.every(
    (operation) => getOperationRoot(operation) === root
  );

  if (!allOperationsShareRoot) {
    return false;
  }

  if (metadata.origin?.kind !== 'native-text-input') {
    return true;
  }

  if (
    firstOperation.type !== 'insert_text' &&
    firstOperation.type !== 'remove_text'
  ) {
    return false;
  }

  const path = firstOperation.path;

  const allOperationsShareTextPath = allSaveableOperations.every(
    (operation) =>
      (operation.type === 'insert_text' || operation.type === 'remove_text') &&
      getOperationRoot(operation) === root &&
      PathApi.equals(operation.path, path)
  );

  if (!allOperationsShareTextPath) {
    return false;
  }

  return allSaveableOperations.every(
    (operation, index) =>
      index === 0 || shouldMerge(operation, allSaveableOperations[index - 1])
  );
};

export const shouldSaveBatch = (operations: readonly Operation[]): boolean =>
  operations.some((operation) => shouldSaveHistoryOperation(operation));
