import type { SlateEditor } from '@udecode/plate-common';

import type { TSuggestionText } from '../types';

import { SUGGESTION_KEYS } from '../BaseSuggestionPlugin';
import { type TSuggestionDescription, getSuggestionKey } from '../utils/index';

export const rejectSuggestion = (
  editor: SlateEditor,
  description: TSuggestionDescription
) => {
  const suggestionKey = getSuggestionKey(description.userId);

  editor.tf.withoutNormalizing(() => {
    editor.tf.unsetNodes([suggestionKey], {
      at: [],
      match: (n) => {
        const node = n as TSuggestionText;

        // unset deletions
        return (
          node[SUGGESTION_KEYS.id] === description.suggestionId &&
          !!node.suggestionDeletion &&
          !!node[suggestionKey]
        );
      },
    });
    editor.tf.removeNodes({
      at: [],
      match: (n) => {
        const node = n as TSuggestionText;

        // remove additions
        return (
          node[SUGGESTION_KEYS.id] === description.suggestionId &&
          !node.suggestionDeletion &&
          !!node[suggestionKey]
        );
      },
    });
  });
};
