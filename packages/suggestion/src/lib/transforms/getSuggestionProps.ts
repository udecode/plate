import type { SlateEditor } from 'platejs';

import { KEYS } from 'platejs';

import { BaseSuggestionPlugin } from '../BaseSuggestionPlugin';
import { getSuggestionKey } from '../utils/index';

export const getSuggestionProps = (
  editor: SlateEditor,
  id: string,
  {
    createdAt = Date.now(),
    suggestionDeletion,
    suggestionUpdate,
  }: {
    createdAt?: number;
    suggestionDeletion?: boolean;
    suggestionUpdate?: any;
  } = {}
) => {
  const type = suggestionDeletion
    ? 'remove'
    : suggestionUpdate
      ? 'update'
      : 'insert';

  const res = {
    [getSuggestionKey(id)]: {
      id,
      createdAt,
      type,
      userId: editor.getOptions(BaseSuggestionPlugin).currentUserId!,
    },
    [KEYS.suggestion]: true,
  };

  return res;
};
