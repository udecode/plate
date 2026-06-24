import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Editor, Operation } from '@platejs/plite';

import { removeRejectedYjsOperationsFromHistory } from '../src/core/history';

type HistoryBatchLike = {
  operations?: Operation[];
  statePatches?: readonly unknown[];
};

const createHistoryEditor = (history: {
  redos: HistoryBatchLike[];
  undos: HistoryBatchLike[];
}): Editor =>
  ({
    read: (fn: (state: unknown) => unknown) =>
      fn({
        history: {
          redos: () => history.redos,
          undos: () => history.undos,
        },
      }),
  }) as Editor;

describe('@platejs/yjs history contract', () => {
  it('skips state-only history batches when removing rejected Yjs operations', () => {
    const operation: Operation = {
      offset: 0,
      path: [0, 0],
      text: '!',
      type: 'insert_text',
    };
    const stateOnlyBatch = { statePatches: [{}] };
    const history = {
      redos: [],
      undos: [{ operations: [operation] }, stateOnlyBatch],
    };

    removeRejectedYjsOperationsFromHistory(createHistoryEditor(history), [
      operation,
    ]);

    assert.deepEqual(history.undos, [stateOnlyBatch]);
  });

  it('matches rejected operations regardless of object key order', () => {
    const operation: Operation = {
      offset: 0,
      path: [0, 0],
      text: '!',
      type: 'insert_text',
    };
    const historyOperation = {
      text: '!',
      path: [0, 0],
      type: 'insert_text',
      offset: 0,
    } as Operation;
    const history = {
      redos: [],
      undos: [{ operations: [historyOperation] }],
    };

    removeRejectedYjsOperationsFromHistory(createHistoryEditor(history), [
      operation,
    ]);

    assert.deepEqual(history.undos, []);
  });

  it('removes rejected operation suffixes from redo history', () => {
    const keepOperation: Operation = {
      offset: 0,
      path: [0, 0],
      text: 'a',
      type: 'insert_text',
    };
    const rejectedOperation: Operation = {
      offset: 1,
      path: [0, 0],
      text: '!',
      type: 'insert_text',
    };
    const history = {
      redos: [{ operations: [keepOperation, rejectedOperation] }],
      undos: [],
    };

    removeRejectedYjsOperationsFromHistory(createHistoryEditor(history), [
      rejectedOperation,
    ]);

    assert.deepEqual(history.redos, [{ operations: [keepOperation] }]);
  });
});
