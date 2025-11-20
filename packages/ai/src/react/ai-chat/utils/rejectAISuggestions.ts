import type { PlateEditor } from 'platejs/react';

import {
  getSuggestionKey,
  getTransientSuggestionKey,
  rejectSuggestion,
} from '@platejs/suggestion';
import { SuggestionPlugin } from '@platejs/suggestion/react';

export const rejectAISuggestions = (editor: PlateEditor) => {
  const suggestions = editor.getApi(SuggestionPlugin).suggestion.nodes({
    transient: true,
  });

  suggestions.forEach(([suggestionNode]) => {
    const suggestionData = editor
      .getApi(SuggestionPlugin)
      .suggestion.suggestionData(suggestionNode);

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

  editor.tf.unsetNodes([getTransientSuggestionKey()], {
    at: [],
    mode: 'all',
    match: (n) => !!n[getTransientSuggestionKey()],
  });
};
