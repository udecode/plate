import {
  PlateEditor,
  Value,
  removeNodes,
  unsetNodes,
  withoutNormalizing,
} from '@udecode/plate-common';

import { KEY_SUGGESTION_ID, MARK_SUGGESTION } from '../constants';
import { TSuggestionText } from '../types';
import { TSuggestionDescription, getSuggestionKey } from '../utils/index';

export const acceptSuggestion = <V extends Value = Value>(
  editor: PlateEditor<V>,
  description: TSuggestionDescription
) => {
  withoutNormalizing(editor as any, () => {
    const suggestionKey = getSuggestionKey(description.userId);

    unsetNodes(editor as any, [MARK_SUGGESTION, suggestionKey], {
      at: [],
      match: (n) => {
        const node = n as TSuggestionText;

        // unset additions
        return (
          node[KEY_SUGGESTION_ID] === description.suggestionId &&
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
          node[KEY_SUGGESTION_ID] === description.suggestionId &&
          !!node.suggestionDeletion &&
          !!node[suggestionKey]
        );
      },
    });
  });
};
