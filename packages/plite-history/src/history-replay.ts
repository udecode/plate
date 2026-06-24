import {
  type Editor,
  type Operation,
  PathApi,
  type Value,
} from '@platejs/plite';
import {
  applyOperation,
  getOperationRoot,
  MAIN_ROOT_KEY,
} from '@platejs/plite/internal';

const withHistoricReplayRoot = <V extends Value>(
  operation: Operation<V>
): Operation<V> =>
  operation.root === undefined
    ? ({ ...operation, root: MAIN_ROOT_KEY } as Operation<V>)
    : operation;

const compactHistoricTextOperations = <V extends Value>(
  operations: readonly Operation<V>[]
): Operation<V>[] => {
  const compacted: Operation<V>[] = [];

  for (const operation of operations) {
    const previous = compacted.at(-1);

    if (
      previous?.type === 'insert_text' &&
      operation.type === 'insert_text' &&
      getOperationRoot(previous) === getOperationRoot(operation) &&
      PathApi.equals(previous.path, operation.path) &&
      operation.offset === previous.offset + previous.text.length
    ) {
      previous.text += operation.text;
      continue;
    }

    if (
      previous?.type === 'remove_text' &&
      operation.type === 'remove_text' &&
      getOperationRoot(previous) === getOperationRoot(operation) &&
      PathApi.equals(previous.path, operation.path) &&
      operation.offset + operation.text.length === previous.offset
    ) {
      previous.offset = operation.offset;
      previous.text = operation.text + previous.text;
      continue;
    }

    compacted.push(
      operation.type === 'insert_text' || operation.type === 'remove_text'
        ? ({ ...operation, path: [...operation.path] } as Operation<V>)
        : operation
    );
  }

  return compacted;
};

export const replayHistoricOperations = <V extends Value>(
  editor: Editor<V>,
  operations: readonly Operation<V>[]
) => {
  for (const operation of compactHistoricTextOperations(operations)) {
    applyOperation(editor, withHistoricReplayRoot(operation));
  }
};
