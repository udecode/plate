import type { BaseEditor } from '@platejs/core';
import type { Descendant } from '@platejs/plite';

import { nanoid } from '@platejs/core';
import { ElementApi } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import { BaseSuggestionPlugin } from '../BaseSuggestionPlugin';
import { getSuggestionKey, getTransientSuggestionKey } from '../utils/index';

export const getSuggestionProps = (
  editor: BaseEditor,
  node: Descendant,
  {
    id = nanoid(),
    createdAt = Date.now(),
    suggestionDeletion,
    suggestionUpdate,
    transient,
  }: {
    id?: string;
    createdAt?: number;
    suggestionDeletion?: boolean;
    suggestionUpdate?: any;
    transient?: boolean;
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
    userId: editor.plugin(BaseSuggestionPlugin).getOptions().currentUserId!,
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

  if (transient) {
    res[getTransientSuggestionKey()] = true;
  }

  return res;
};
