import {
  type PlateEditor,
  removeNodes,
  unsetNodes,
  withoutNormalizing,
} from '@udecode/plate-common';

import type { TSuggestionText } from '../types';

import { KEY_SUGGESTION_ID } from '../SuggestionPlugin';
import { type TSuggestionDescription, getSuggestionKey } from '../utils/index';

export const rejectSuggestion = (
  editor: PlateEditor,
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
          node[KEY_SUGGESTION_ID] === description.suggestionId &&
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
          node[KEY_SUGGESTION_ID] === description.suggestionId &&
          !node.suggestionDeletion &&
          !!node[suggestionKey]
        );
      },
    });
  });
};
