import type { Descendant, SlateEditor } from 'platejs';

import { ElementApi, KEYS, nanoid } from 'platejs';

import { BaseSuggestionPlugin } from '../BaseSuggestionPlugin';
import { getSuggestionKey } from '../utils/index';

export const getSuggestionProps = (
  editor: SlateEditor,
  node: Descendant,
  {
    id = nanoid(),
    createdAt = Date.now(),
    suggestionDeletion,
    suggestionUpdate,
  }: {
    id?: string;
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

  const isElement = ElementApi.isElement(node);

  const suggestionData = {
    id,
    createdAt,
    type,
    userId: editor.getOptions(BaseSuggestionPlugin).currentUserId!,
  };

  if (isElement) {
    return {
      [KEYS.suggestion]: suggestionData,
    };
  }

  const res = {
    [getSuggestionKey(id)]: suggestionData,
    [KEYS.suggestion]: true,
  };

  return res;
};
