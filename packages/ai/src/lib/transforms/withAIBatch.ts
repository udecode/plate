import type { BaseEditor } from '@platejs/core';
import type { EditorUpdateTransaction } from '@platejs/plite';
import { defineStateField } from '@platejs/plite';

export const aiBatchField = defineStateField({
  key: 'ai.batch',
  collab: 'local',
  history: 'push',
  initial: 0,
});

export const withAIBatch = (
  editor: BaseEditor,
  fn: (tx: EditorUpdateTransaction) => void,
  {
    split,
  }: {
    split?: boolean;
  } = {}
) => {
  const write = split
    ? editor.update.history.newBatch
    : editor.update.history.merge;

  write((tx) => {
    tx.setField(aiBatchField, (batch) => batch + 1);
    fn(tx);
  });
};
