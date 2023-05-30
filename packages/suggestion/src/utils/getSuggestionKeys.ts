import { isDefined, TNode } from '@udecode/plate-common';
import { MARK_SUGGESTION } from '../constants';

export const getSuggestionKey = (id = '0') => `${MARK_SUGGESTION}_${id}`;

export const isSuggestionKey = (key: string) =>
  key.startsWith(`${MARK_SUGGESTION}_`);

export const getSuggestionKeys = (node: TNode) => {
  const keys: string[] = [];

  Object.keys(node).forEach((key) => {
    if (isSuggestionKey(key)) keys.push(key);
  });

  return keys;
};

export const getSuggestionUserIdByKey = (key?: string | null) =>
  isDefined(key) ? key.split(`${MARK_SUGGESTION}_`)[1] : null;

export const getSuggestionUserIds = (node: TNode) => {
  return getSuggestionKeys(node).map(
    (key) => getSuggestionUserIdByKey(key) as string
  );
};

export const getSuggestionUserId = (node: TNode) => {
  return getSuggestionUserIds(node)[0];
};
