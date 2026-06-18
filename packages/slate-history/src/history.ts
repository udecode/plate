import {
  type EditorStatePatch,
  type Operation,
  OperationApi,
  type Range,
  type Value,
} from '@platejs/slate';
import { isObject } from '@platejs/slate/internal';

export interface Batch<V extends Value = Value> {
  /** Operations captured in one undo or redo unit. */
  operations: Operation<V>[];
  /** Selection before the batch was applied. */
  selectionBefore: Range | null;
  /** Root owning `selectionBefore` when the batch belongs to a non-main root. */
  selectionBeforeRoot?: string;
  /** State-field patches captured in the same undo or redo unit. */
  statePatches: EditorStatePatch[];
}

/**
 * Undo and redo stacks for editor operations and state-field patches.
 */

export interface History<V extends Value = Value> {
  redos: Batch<V>[];
  undos: Batch<V>[];
}

// eslint-disable-next-line no-redeclare
export const History = {
  /**
   * Check if a value is a `History` object.
   */

  isHistory(value: unknown): value is History {
    return (
      isObject(value) &&
      Array.isArray(value.redos) &&
      Array.isArray(value.undos) &&
      (value.redos.length === 0 ||
        OperationApi.isOperationList(value.redos[0].operations)) &&
      (value.undos.length === 0 ||
        OperationApi.isOperationList(value.undos[0].operations))
    );
  },
};
