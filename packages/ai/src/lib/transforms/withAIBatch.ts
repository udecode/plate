import type { BaseEditor } from '@platejs/core';
import type { EditorUpdateTransaction } from '@platejs/plite';
import {
  defineEditorExtension,
  defineEffect,
  defineStateField,
} from '@platejs/plite';

export const aiBatchEffect = defineEffect<number>({
  invert: (value) => -value,
  key: 'ai.batch',
});

export const aiBatchField = defineStateField({
  key: 'ai.batch',
  collab: 'local',
  history: 'push',
  initial: 0,
  reduce: (value, effect) =>
    effect.type === aiBatchEffect ? value + effect.value : value,
});

export const aiBatchEffectExtension = defineEditorExtension({
  effects: [aiBatchEffect],
  name: 'ai-batch-effect',
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
  editor.update({ history: split ? 'new-batch' : 'merge' }, (tx) => {
    tx.effects.emit(aiBatchEffect, 1);
    fn(tx);
  });
};
