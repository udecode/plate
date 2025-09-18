import type { SlateEditor } from 'platejs';

import { getTransientSuggestionKey } from '@platejs/suggestion';

export const undoAI = (editor: SlateEditor) => {
  const hasAINodeOrAISuggestion =
    editor.api.some({
      at: [],
      match: (n) => !!(n as any).ai,
    }) ||
    editor.api.some({
      at: [],
      match: (n) => !!n[getTransientSuggestionKey()],
    });

  console.log(
    '🚀 ~ undoAI ~ hasAINodeOrAISuggestion:',
    hasAINodeOrAISuggestion
  );

  if ((editor.history.undos.at(-1) as any)?.ai && hasAINodeOrAISuggestion) {
    editor.undo();
    editor.history.redos.pop();
  }
};
