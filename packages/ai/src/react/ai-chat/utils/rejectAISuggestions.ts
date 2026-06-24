import {
  getSuggestionKey,
  getTransientSuggestionKey,
  rejectSuggestion,
} from '@platejs/suggestion';

import type { AIChatPlateEditor } from '../internal/editorTypes';

export const rejectAISuggestions = (editor: AIChatPlateEditor) => {
  const suggestions = editor.api.suggestion.nodes({
    transient: true,
  });

  suggestions.forEach(([suggestionNode]: [any, any]) => {
    const suggestionData = editor.api.suggestion.suggestionData(suggestionNode);

    if (!suggestionData) return;

    const description = {
      createdAt: new Date(suggestionData.createdAt),
      keyId: getSuggestionKey(suggestionData.id),
      suggestionId: suggestionData.id,
      type: suggestionData.type,
      userId: suggestionData.userId,
    };

    rejectSuggestion(editor, description);
  });

  editor.update((tx) => {
    tx.nodes.unset([getTransientSuggestionKey()], {
      at: [],
      mode: 'all',
      match: (n) =>
        Boolean((n as Record<string, unknown>)[getTransientSuggestionKey()]),
    });
  });
};
