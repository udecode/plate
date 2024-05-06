import {
  type PlateEditor,
  type Value,
  getPluginOptions,
} from '@udecode/plate-common/server';

import type { SuggestionPlugin } from '../types';

import { KEY_SUGGESTION_ID, MARK_SUGGESTION } from '../constants';
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
    [MARK_SUGGESTION]: true,
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
