import { type PlateEditor, getPluginOptions } from '@udecode/plate-common';

import type { SuggestionPluginOptions } from '../types';

import { KEY_SUGGESTION_ID, SuggestionPlugin } from '../SuggestionPlugin';
import { getSuggestionKey } from '../utils/index';

export const getSuggestionCurrentUserKey = (editor: PlateEditor) => {
  const { currentUserId } = getPluginOptions<SuggestionPluginOptions>(
    editor,
    SuggestionPlugin.key
  );

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
    [KEY_SUGGESTION_ID]: id,
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
