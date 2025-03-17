import type { SlateEditor } from '@udecode/plate';

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
    [BaseSuggestionPlugin.key]: true,
    [getSuggestionKey(id)]: {
      id,
      createdAt,
      type,
      userId: editor.getOptions(BaseSuggestionPlugin).currentUserId!,
    },
  };

  return res;
};
