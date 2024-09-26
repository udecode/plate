import {
  type SlateEditor,
  removeNodes,
  unsetNodes,
  withoutNormalizing,
} from '@udecode/plate-common';

import type { TSuggestionText } from '../types';

import { BaseSuggestionPlugin, SUGGESTION_KEYS } from '../BaseSuggestionPlugin';
import { type TSuggestionDescription, getSuggestionKey } from '../utils/index';

export const acceptSuggestion = (
  editor: SlateEditor,
  description: TSuggestionDescription
) => {
  withoutNormalizing(editor as any, () => {
    const suggestionKey = getSuggestionKey(description.userId);

    unsetNodes(editor as any, [BaseSuggestionPlugin.key, suggestionKey], {
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
    removeNodes(editor as any, {
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
