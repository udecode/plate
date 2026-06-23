import type { SlateEditor } from 'platejs';

import { getTransientSuggestionKey } from '@platejs/suggestion';

import { cancelAIPreview, hasAIPreview } from './aiStreamSnapshot';

type AIHistoryBatch = {
  ai?: unknown;
};

export const undoAI = (editor: SlateEditor) => {
  if (hasAIPreview(editor) && cancelAIPreview(editor)) return;

  const hasAINodeOrAISuggestion =
    editor.api.some({
      at: [],
      match: (n) => !!(n as Record<string, unknown>).ai,
    }) ||
    editor.api.some({
      at: [],
      match: (n) => !!n[getTransientSuggestionKey()],
    });

  if (
    (editor.history.undos.at(-1) as AIHistoryBatch | undefined)?.ai &&
    hasAINodeOrAISuggestion
  ) {
    editor.undo();
    editor.history.redos.pop();

    return;
  }

  if (hasAINodeOrAISuggestion) {
    cancelAIPreview(editor);
  }
};
