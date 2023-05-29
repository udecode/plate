import { PlateEditor, Value } from '@udecode/plate-common';
import { removeNodes, unsetNodes, withoutNormalizing } from 'slate';
import { KEY_SUGGESTION_ID } from '../constants';
import { TSuggestionText } from '../types';
import { getSuggestionKey, TSuggestionDescription } from '../utils/index';

export const rejectSuggestion = <V extends Value = Value>(
  editor: PlateEditor<V>,
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
