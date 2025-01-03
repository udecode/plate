import type { SlateEditor } from '@udecode/plate-common';

import type { TSuggestionText } from '../types';

import { BaseSuggestionPlugin, SUGGESTION_KEYS } from '../BaseSuggestionPlugin';
import { type TSuggestionDescription, getSuggestionKey } from '../utils/index';

export const acceptSuggestion = (
  editor: SlateEditor,
  description: TSuggestionDescription
) => {
  editor.tf.withoutNormalizing(() => {
    const suggestionKey = getSuggestionKey(description.userId);

    editor.tf.unsetNodes([BaseSuggestionPlugin.key, suggestionKey], {
      at: [],
      match: (n) => {
        const node = n as TSuggestionText;

        // unset additions
        return (
          node[SUGGESTION_KEYS.id] === description.suggestionId &&
          !node.suggestionDeletion &&
          !!node[suggestionKey]
        );
      },
    });
    editor.tf.removeNodes({
      at: [],
      match: (n) => {
        const node = n as TSuggestionText;

        // remove deletions
        return (
          node[SUGGESTION_KEYS.id] === description.suggestionId &&
          !!node.suggestionDeletion &&
          !!node[suggestionKey]
        );
      },
    });
  });
};
