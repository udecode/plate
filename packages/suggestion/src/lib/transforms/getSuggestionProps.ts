import type { SlateEditor } from '@udecode/plate-common';

import { BaseSuggestionPlugin, SUGGESTION_KEYS } from '../BaseSuggestionPlugin';
import { getSuggestionKey } from '../utils/index';

export const getSuggestionCurrentUserKey = (editor: SlateEditor) => {
  const { currentUserId } = editor.getOptions(BaseSuggestionPlugin);

  return getSuggestionKey(currentUserId!);
};

export const getSuggestionProps = (
  editor: SlateEditor,
  id: string,
  {
    suggestionDeletion,
    suggestionUpdate,
  }: {
    suggestionDeletion?: boolean;
    suggestionUpdate?: any;
  } = {}
) => {
  const res = {
    [BaseSuggestionPlugin.key]: true,
    [SUGGESTION_KEYS.id]: id,
    [getSuggestionCurrentUserKey(editor)]: true,
  };

  if (suggestionDeletion) {
    res.suggestionDeletion = true;
  }
  if (suggestionUpdate) {
    res.suggestionUpdate = suggestionUpdate;
  }

  return res;
};
