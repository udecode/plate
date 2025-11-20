import {
  type SlateEditor,
  type TNode,
  type TText,
  isDefined,
  KEYS,
} from 'platejs';

import { BaseSuggestionPlugin } from '../BaseSuggestionPlugin';
import { getInlineSuggestionData } from './getSuggestionId';

export const getSuggestionKey = (id = '0'): string =>
  `${KEYS.suggestion}_${id}`;

export const isSuggestionKey = (key: string) =>
  key.startsWith(`${KEYS.suggestion}_`);

export const getSuggestionKeys = (node: TNode) => {
  const keys: string[] = [];

  Object.keys(node).forEach((key) => {
    if (isSuggestionKey(key)) keys.push(key);
  });

  return keys;
};

export const getSuggestionUserIdByKey = (key?: string | null) =>
  isDefined(key) ? key.split(`${KEYS.suggestion}_`)[1] : null;

export const getSuggestionUserIds = (node: TNode) =>
  getSuggestionKeys(node).map((key) => getSuggestionUserIdByKey(key) as string);

export const getSuggestionUserId = (node: TNode) =>
  getSuggestionUserIds(node)[0];

export const isCurrentUserSuggestion = (editor: SlateEditor, node: TText) => {
  const { currentUserId } = editor.getOptions(BaseSuggestionPlugin);

  return getInlineSuggestionData(node)?.userId === currentUserId;
};
