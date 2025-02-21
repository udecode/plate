import {
  type SlateEditor,
  type TNode,
  type TText,
  isDefined,
} from '@udecode/plate';

import { BaseSuggestionPlugin } from '../BaseSuggestionPlugin';
import { getInlineSuggestionData } from './getSuggestionId';

export const getSuggestionKey = (id = '0'): string =>
  `${BaseSuggestionPlugin.key}_${id}`;

export const isSuggestionKey = (key: string) =>
  key.startsWith(`${BaseSuggestionPlugin.key}_`);

export const getSuggestionKeys = (node: TNode) => {
  const keys: string[] = [];

  Object.keys(node).forEach((key) => {
    if (isSuggestionKey(key)) keys.push(key);
  });

  return keys;
};

export const getSuggestionUserIdByKey = (key?: string | null) =>
  isDefined(key) ? key.split(`${BaseSuggestionPlugin.key}_`)[1] : null;

export const getSuggestionUserIds = (node: TNode) => {
  return getSuggestionKeys(node).map(
    (key) => getSuggestionUserIdByKey(key) as string
  );
};

export const getSuggestionUserId = (node: TNode) => {
  return getSuggestionUserIds(node)[0];
};

export const isCurrentUserSuggestion = (editor: SlateEditor, node: TText) => {
  const { currentUserId } = editor.getOptions(BaseSuggestionPlugin);

  return getInlineSuggestionData(node)?.userId === currentUserId;
};
