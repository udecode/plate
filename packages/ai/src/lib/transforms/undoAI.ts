import type { BaseEditor } from '@platejs/core';

import { SUGGESTION_TRANSIENT_KEY } from '@platejs/suggestion';

import { cancelAIPreview, hasAIPreview } from './aiStreamSnapshot';
import { aiBatchEffect } from './withAIBatch';

export const undoAI = (editor: BaseEditor) => {
  if (hasAIPreview(editor) && cancelAIPreview(editor)) return;

  const hasAINodeOrAISuggestion =
    editor.read.nodes.some({
      at: [],
      match: (node) => Boolean(Reflect.get(node, 'ai')),
    }) ||
    editor.read.nodes.some({
      at: [],
      match: (node) => Boolean(Reflect.get(node, SUGGESTION_TRANSIENT_KEY)),
    });

  const lastBatch = editor.read.history.undos().at(-1);
  const isAIBatch = lastBatch?.effects.some(
    (effect) => effect.type === aiBatchEffect
  );

  if (isAIBatch && hasAINodeOrAISuggestion) {
    editor.update((tx) => {
      tx.history.undo();
      tx.history.discardRedo();
    });

    return;
  }

  if (hasAINodeOrAISuggestion) {
    cancelAIPreview(editor);
  }
};
