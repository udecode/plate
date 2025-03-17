// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { isPlainObject } from 'is-plain-object';

import {
  type Editor,
  type Operation,
  type TRange,
  OperationApi,
} from '../interfaces/index';

/** Weakmaps for attaching state to the editor. */

const SAVING = new WeakMap<Editor, boolean | undefined>();

const MERGING = new WeakMap<Editor, boolean | undefined>();

const SPLITTING_ONCE = new WeakMap<Editor, boolean | undefined>();

/** `HistoryApi` contains helpers for history-enabled editors. */
export const HistoryApi = {
  /** Check if a value is a `History` object. */

  isHistory(value: any): value is History {
    return (
      isPlainObject(value) &&
      Array.isArray(value.redos) &&
      Array.isArray(value.undos) &&
      (value.redos.length === 0 ||
        OperationApi.isOperationList(value.redos[0].operations)) &&
      (value.undos.length === 0 ||
        OperationApi.isOperationList(value.undos[0].operations))
    );
  },

  /** Get the merge flag's current value. */
  isMerging(editor: Editor): boolean | undefined {
    return MERGING.get(editor);
  },

  /** Get the splitting once flag's current value. */
  isSaving(editor: Editor): boolean | undefined {
    return SAVING.get(editor);
  },

  isSplittingOnce(editor: Editor): boolean | undefined {
    return SPLITTING_ONCE.get(editor);
  },

  /** Get the saving flag's current value. */
  redo(editor: Editor): void {
    editor.redo();
  },

  /** Redo to the previous saved state. */
  setSplittingOnce(editor: Editor, value: boolean | undefined): void {
    SPLITTING_ONCE.set(editor, value);
  },

  /** Undo to the previous saved state. */
  undo(editor: Editor): void {
    editor.undo();
  },

  /**
   * Apply a series of changes inside a synchronous `fn`, These operations will
   * be merged into the previous history.
   */
  withMerging(editor: Editor, fn: () => void): void {
    const prev = editor.api.isMerging();
    MERGING.set(editor, true);
    fn();
    MERGING.set(editor, prev);
  },

  /**
   * Apply a series of changes inside a synchronous `fn`, ensuring that the
   * first operation starts a new batch in the history. Subsequent operations
   * will be merged as usual.
   */
  withNewBatch(editor: Editor, fn: () => void): void {
    const prev = editor.api.isMerging();
    MERGING.set(editor, true);
    SPLITTING_ONCE.set(editor, true);
    fn();
    MERGING.set(editor, prev);
    SPLITTING_ONCE.delete(editor);
  },

  /**
   * Apply a series of changes inside a synchronous `fn`, without merging any of
   * the new operations into previous save point in the history.
   */
  withoutMerging(editor: Editor, fn: () => void): void {
    const prev = editor.api.isMerging();
    MERGING.set(editor, false);
    fn();
    MERGING.set(editor, prev);
  },

  /**
   * Apply a series of changes inside a synchronous `fn`, without saving any of
   * their operations into the history.
   */
  withoutSaving(editor: Editor, fn: () => void): void {
    const prev = editor.api.isSaving();
    SAVING.set(editor, false);
    fn();
    SAVING.set(editor, prev);
  },
};

export interface History {
  /** Redos of the editor. */
  redos: Batch[];

  /** Undos of the editor. */
  undos: Batch[];
}

/**
 * `History` objects hold all of the operations that are applied to a value, so
 * they can be undone or redone as necessary.
 */

interface Batch {
  operations: Operation[];
  selectionBefore: TRange | null;
}
