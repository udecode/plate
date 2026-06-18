import type { Editor, Value } from '@platejs/slate';

import type { Batch, History } from './history';

const HISTORY = new WeakMap<Editor, History>();
const SAVING = new WeakMap<Editor, boolean | undefined>();
const MERGING = new WeakMap<Editor, boolean | undefined>();
const SPLITTING_ONCE = new WeakMap<Editor, boolean | undefined>();

export const getHistory = <V extends Value>(editor: Editor<V>): History<V> => {
  let history = HISTORY.get(editor) as History<V> | undefined;

  if (!history) {
    history = { redos: [], undos: [] };
    HISTORY.set(editor, history as unknown as History);
  }

  return history;
};

export const writeHistory = <V extends Value>(
  editor: Editor<V>,
  stack: 'redos' | 'undos',
  batch: Batch<V>
) => {
  getHistory(editor)[stack].push(batch);
};

export const clearHistoryState = (editor: Editor) => {
  HISTORY.delete(editor);
  SAVING.delete(editor);
  MERGING.delete(editor);
  SPLITTING_ONCE.delete(editor);
};

export const isMerging = (editor: Editor): boolean | undefined =>
  MERGING.get(editor);

export const isSaving = (editor: Editor): boolean | undefined =>
  SAVING.get(editor);

export const isSplittingOnce = (editor: Editor): boolean | undefined =>
  SPLITTING_ONCE.get(editor);

export const setSplittingOnce = (
  editor: Editor,
  value: boolean | undefined
) => {
  SPLITTING_ONCE.set(editor, value);
};

export const withMerging = (editor: Editor, fn: () => void): void => {
  const previous = isMerging(editor);
  MERGING.set(editor, true);
  try {
    fn();
  } finally {
    MERGING.set(editor, previous);
  }
};

export const withNewBatch = (editor: Editor, fn: () => void): void => {
  const previous = isMerging(editor);
  MERGING.set(editor, true);
  SPLITTING_ONCE.set(editor, true);
  try {
    fn();
  } finally {
    MERGING.set(editor, previous);
    SPLITTING_ONCE.delete(editor);
  }
};

export const withoutMerging = (editor: Editor, fn: () => void): void => {
  const previous = isMerging(editor);
  MERGING.set(editor, false);
  try {
    fn();
  } finally {
    MERGING.set(editor, previous);
  }
};

export const withoutSaving = (editor: Editor, fn: () => void): void => {
  const previous = isSaving(editor);
  SAVING.set(editor, false);
  try {
    fn();
  } finally {
    SAVING.set(editor, previous);
  }
};
