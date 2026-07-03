import type { Editor, Value } from '@platejs/plite';

import type { Batch, History } from './history';

const HISTORY = new WeakMap<Editor, History>();

export const getHistory = <V extends Value>(editor: Editor<V>): History<V> => {
  let history = HISTORY.get(editor) as unknown as History<V> | undefined;

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
};
