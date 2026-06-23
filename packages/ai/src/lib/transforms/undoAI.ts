import type { BasePlateEditor } from 'platejs';

import { getTransientSuggestionKey } from '@platejs/suggestion';

import { getEditorHistory } from '../internal/history';

import { cancelAIPreview, hasAIPreview } from './aiStreamSnapshot';

type AIHistoryBatch = {
  ai?: unknown;
};

export const undoAI = (editor: BasePlateEditor) => {
  if (hasAIPreview(editor) && cancelAIPreview(editor)) return;

  const history = getEditorHistory(editor);
  const hasAINodeOrAISuggestion =
    editor.api.some({
      at: [],
      match: (n: unknown) => !!(n as Record<string, unknown>).ai,
    }) ||
    editor.api.some({
      at: [],
      match: (n: unknown) =>
        !!(n as Record<string, unknown>)[getTransientSuggestionKey()],
    });

  if (
    (history.undos.at(-1) as AIHistoryBatch | undefined)?.ai &&
    hasAINodeOrAISuggestion
  ) {
    editor.undo();
    history.redos.pop();

    return;
  }

  if (hasAINodeOrAISuggestion) {
    cancelAIPreview(editor);
  }
};
