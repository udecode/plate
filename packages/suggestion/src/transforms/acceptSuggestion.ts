import {
  type PlateEditor,
  removeNodes,
  unsetNodes,
  withoutNormalizing,
} from '@udecode/plate-common';

import type { TSuggestionText } from '../types';

import { SUGGESTION_KEYS, SuggestionPlugin } from '../SuggestionPlugin';
import { type TSuggestionDescription, getSuggestionKey } from '../utils/index';

export const acceptSuggestion = (
  editor: PlateEditor,
  description: TSuggestionDescription
) => {
  withoutNormalizing(editor as any, () => {
    const suggestionKey = getSuggestionKey(description.userId);

    unsetNodes(editor as any, [SuggestionPlugin.key, suggestionKey], {
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
