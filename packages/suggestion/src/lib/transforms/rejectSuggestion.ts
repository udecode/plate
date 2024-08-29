import {
  type SlateEditor,
  removeNodes,
  unsetNodes,
  withoutNormalizing,
} from '@udecode/plate-common';

import type { TSuggestionText } from '../types';

import { SUGGESTION_KEYS } from '../SuggestionPlugin';
import { type TSuggestionDescription, getSuggestionKey } from '../utils/index';

export const rejectSuggestion = (
  editor: SlateEditor,
  description: TSuggestionDescription
) => {
  const suggestionKey = getSuggestionKey(description.userId);

  withoutNormalizing(editor as any, () => {
    unsetNodes(editor as any, [suggestionKey], {
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
    removeNodes(editor as any, {
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
