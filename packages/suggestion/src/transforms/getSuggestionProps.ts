import type { PlateEditor } from '@udecode/plate-common';

import { SUGGESTION_KEYS, SuggestionPlugin } from '../SuggestionPlugin';
import { getSuggestionKey } from '../utils/index';

export const getSuggestionCurrentUserKey = (editor: PlateEditor) => {
  const { currentUserId } = editor.getOptions(SuggestionPlugin);

  return getSuggestionKey(currentUserId);
};

export const getSuggestionProps = (
  editor: PlateEditor,
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
    [SUGGESTION_KEYS.id]: id,
    [SuggestionPlugin.key]: true,
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
