import type { Element, Node, Text } from '@platejs/plite';

import { type BasePlateEditor, isDefined, KEYS } from 'platejs';

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

const hasSuggestionUserId = (value: unknown): value is { userId: string } =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as { userId?: unknown }).userId === 'string';

export const getSuggestionUserIds = (node: Node) =>
  getSuggestionKeys(node)
    .map((key) => {
      const value = (node as Record<string, unknown>)[key];

      return hasSuggestionUserId(value) ? value.userId : undefined;
    })
    .filter(isDefined);

export const getSuggestionUserId = (node: Node) =>
  getSuggestionUserIds(node)[0];

export const isCurrentUserSuggestion = (
  editor: BasePlateEditor,
  node: Element | Text
) => {
  const { currentUserId } = editor.getOptions(BaseSuggestionPlugin);

  return getInlineSuggestionData(node)?.userId === currentUserId;
};
