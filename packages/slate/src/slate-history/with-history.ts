import {
  type Editor,
  type LegacyEditorMethods,
  type Operation,
  OperationApi,
  PathApi,
} from '../interfaces/index';

/**
 * The `withHistory` plugin keeps track of the operation history of a Slate
 * editor as operations are applied to it, using undo and redo stacks.
 */
export const withHistory = <T extends Editor>(editor: T) => {
  const e = editor as Editor & LegacyEditorMethods;
  const { apply } = e;
  e.history = { redos: [], undos: [] };

  e.redo = () => {
    const { history } = e;
    const { redos } = history;

    if (redos.length > 0) {
      const batch = redos.at(-1)!;

      if (batch.selectionBefore) {
        e.tf.setSelection(batch.selectionBefore);
      }

      e.tf.withoutSaving(() => {
        e.tf.withoutNormalizing(() => {
          for (const op of batch.operations) {
            e.apply(op);
          }
        });
      });

      history.redos.pop();
      e.writeHistory('undos', batch);
    }
  };

  e.undo = () => {
    const { history } = e;
    const { undos } = history;

    if (undos.length > 0) {
      const batch = undos.at(-1)!;

      e.tf.withoutSaving(() => {
        e.tf.withoutNormalizing(() => {
          const inverseOps = batch.operations
            .map(OperationApi.inverse)
            .reverse();

          for (const op of inverseOps) {
            e.apply(op);
          }

          if (batch.selectionBefore) {
            e.tf.setSelection(batch.selectionBefore);
          }
        });
      });

      e.writeHistory('redos', batch);
      history.undos.pop();
    }
  };

  e.apply = (op: Operation) => {
    const { history, operations } = e;
    const { undos } = history;
    const lastBatch = undos.at(-1);
    const lastOp = lastBatch?.operations.at(-1);
    let save = e.api.isSaving();
    let merge = e.api.isMerging();

    if (save == null) {
      save = shouldSave(op, lastOp);
    }
    if (save) {
      if (merge == null) {
        if (lastBatch == null) {
          merge = false;
        } else if (operations.length > 0) {
          merge = true;
        } else {
          merge = shouldMerge(op, lastOp);
        }
      }
      if (e.api.isSplittingOnce()) {
        merge = false;
        e.tf.setSplittingOnce(undefined);
      }
      if (lastBatch && merge) {
        lastBatch.operations.push(op);
      } else {
        const batch = {
          operations: [op],
          selectionBefore: e.selection,
        };
        e.writeHistory('undos', batch);
      }

      while (undos.length > 100) {
        undos.shift();
      }

      history.redos = [];
    }

    apply(op);
  };

  e.writeHistory = (stack: 'redos' | 'undos', batch: any) => {
    e.history[stack].push(batch);
  };

  return e as T;
};

/** Check whether to merge an operation into the previous operation. */

const shouldMerge = (op: Operation, prev: Operation | undefined): boolean => {
  if (
    prev &&
    op.type === 'insert_text' &&
    prev.type === 'insert_text' &&
    op.offset === prev.offset + prev.text.length &&
    PathApi.equals(op.path, prev.path)
  ) {
    return true;
  }
  if (
    prev &&
    op.type === 'remove_text' &&
    prev.type === 'remove_text' &&
    op.offset + op.text.length === prev.offset &&
    PathApi.equals(op.path, prev.path)
  ) {
    return true;
  }

  return false;
};

/** Check whether an operation needs to be saved to the history. */

const shouldSave = (op: Operation, _: Operation | undefined): boolean => {
  if (op.type === 'set_selection') {
    return false;
  }

  return true;
};
