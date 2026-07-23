import type { PlateEditor } from '@platejs/core/react';

import {
  type BaseSuggestionConfig,
  SUGGESTION_TRANSIENT_KEY,
} from '@platejs/suggestion';
import { SuggestionPlugin } from '@platejs/suggestion/react';

export const rejectAISuggestions = (editor: PlateEditor) => {
  const suggestionEditor = editor as PlateEditor<any, BaseSuggestionConfig>;
  const suggestionApi = suggestionEditor.plugin(SuggestionPlugin).api;
  const suggestions = suggestionApi.nodes({
    transient: true,
  });

  suggestions.forEach(([suggestionNode]) => {
    const suggestionData = suggestionApi.suggestionData(suggestionNode);

    if (!suggestionData) return;

    const description = {
      createdAt: new Date(suggestionData.createdAt),
      keyId: suggestionApi.key(suggestionData.id),
      suggestionId: suggestionData.id,
      type: suggestionData.type,
      userId: suggestionData.userId,
    };

    suggestionEditor.update.suggestion.reject(description);
  });

  editor.update.nodes.unset([SUGGESTION_TRANSIENT_KEY], {
    at: [],
    mode: 'all',
    match: (node) => Boolean(Reflect.get(node, SUGGESTION_TRANSIENT_KEY)),
  });
};
