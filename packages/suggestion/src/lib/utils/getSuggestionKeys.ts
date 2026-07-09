import type { BaseEditor } from '@platejs/core';
import type { Node, Text } from '@platejs/plite';
import { KEYS } from '@platejs/utils';
import { isDefined } from '@udecode/utils';

import { BaseSuggestionPlugin } from '../BaseSuggestionPlugin';
import { getInlineSuggestionData } from './getSuggestionId';

export const getSuggestionKey = (id = '0'): string =>
  `${KEYS.suggestion}_${id}`;

export const isSuggestionKey = (key: string) =>
  key.startsWith(`${KEYS.suggestion}_`);

export const getSuggestionKeys = (node: Node) => {
  const keys: string[] = [];

  Object.keys(node).forEach((key) => {
    if (isSuggestionKey(key)) keys.push(key);
  });

  return keys;
};

export const getSuggestionUserIdByKey = (key?: string | null) =>
  isDefined(key) ? key.split(`${KEYS.suggestion}_`)[1] : null;

export const getSuggestionUserIds = (node: Node) =>
  getSuggestionKeys(node)
    .map((key) => (node as any)[key]?.userId)
    .filter(isDefined);

export const getSuggestionUserId = (node: Node) =>
  getSuggestionUserIds(node)[0];

export const isCurrentUserSuggestion = (editor: BaseEditor, node: Text) => {
  const { currentUserId } = editor.plugin(BaseSuggestionPlugin).getOptions();

  return getInlineSuggestionData(node)?.userId === currentUserId;
};
