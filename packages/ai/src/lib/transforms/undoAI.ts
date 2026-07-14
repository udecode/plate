import type { BaseEditor } from '@platejs/core';

import { getTransientSuggestionKey } from '@platejs/suggestion';

import { cancelAIPreview, hasAIPreview } from './aiStreamSnapshot';
import { aiBatchField } from './withAIBatch';

export const undoAI = (editor: BaseEditor) => {
  if (hasAIPreview(editor) && cancelAIPreview(editor)) return;

  const hasAINodeOrAISuggestion =
    editor.read.nodes.some({
      at: [],
      match: (node) => Boolean(Reflect.get(node, 'ai')),
    }) ||
    editor.read.nodes.some({
      at: [],
      match: (node) => Boolean(Reflect.get(node, getTransientSuggestionKey())),
    });

  const lastBatch = editor.read.history.undos().at(-1);
  const isAIBatch = lastBatch?.statePatches.some(
    (patch) => patch.key === aiBatchField.key
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
