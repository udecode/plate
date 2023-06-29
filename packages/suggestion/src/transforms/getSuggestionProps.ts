import { PlateEditor, Value, getPluginOptions } from '@udecode/plate-common';

import { KEY_SUGGESTION_ID, MARK_SUGGESTION } from '../constants';
import { SuggestionPlugin } from '../types';
import { getSuggestionKey } from '../utils/index';

export const getSuggestionCurrentUserKey = <V extends Value>(
  editor: PlateEditor<V>
) => {
  const { currentUserId } = getPluginOptions<SuggestionPlugin, V>(
    editor,
    MARK_SUGGESTION
  );

  return getSuggestionKey(currentUserId);
};

export const getSuggestionProps = <V extends Value>(
  editor: PlateEditor<V>,
  id: string,
  { suggestionDeletion }: { suggestionDeletion?: boolean } = {}
) => {
  const res = {
    [MARK_SUGGESTION]: true,
    [KEY_SUGGESTION_ID]: id,
    [getSuggestionCurrentUserKey(editor)]: true,
  };

  if (suggestionDeletion) {
    res.suggestionDeletion = true;
  }

  return res;
};
