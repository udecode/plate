import type { PlateEditor } from '@platejs/core/react';

import {
  acceptSuggestion,
  getSuggestionKey,
  getTransientSuggestionKey,
} from '@platejs/suggestion';
import { SuggestionPlugin } from '@platejs/suggestion/react';

export const acceptAISuggestions = (editor: PlateEditor) => {
  const suggestionApi = editor.plugin(SuggestionPlugin).api;
  const suggestions = suggestionApi.nodes({
    transient: true,
  });

  suggestions.forEach(([suggestionNode]) => {
    const suggestionData = suggestionApi.suggestionData(suggestionNode);

    if (!suggestionData) return;

    const description = {
      createdAt: new Date(suggestionData.createdAt),
      keyId: getSuggestionKey(suggestionData.id),
      suggestionId: suggestionData.id,
      type: suggestionData.type,
      userId: suggestionData.userId,
    };

    acceptSuggestion(editor, description);
  });

  editor.update.nodes.unset([getTransientSuggestionKey()], {
    at: [],
    mode: 'all',
    match: (node) => Boolean(Reflect.get(node, getTransientSuggestionKey())),
  });
};
