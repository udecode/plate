import { type TNode, isDefined } from '@udecode/plate-common';

import { SuggestionPlugin } from '../SuggestionPlugin';

export const getSuggestionKey = (id = '0') => `${SuggestionPlugin.key}_${id}`;

export const isSuggestionKey = (key: string) =>
  key.startsWith(`${SuggestionPlugin.key}_`);

export const getSuggestionKeys = (node: TNode) => {
  const keys: string[] = [];

  Object.keys(node).forEach((key) => {
    if (isSuggestionKey(key)) keys.push(key);
  });

  return keys;
};

export const getSuggestionUserIdByKey = (key?: null | string) =>
  isDefined(key) ? key.split(`${SuggestionPlugin.key}_`)[1] : null;

export const getSuggestionUserIds = (node: TNode) => {
  return getSuggestionKeys(node).map(
    (key) => getSuggestionUserIdByKey(key) as string
  );
};

export const getSuggestionUserId = (node: TNode) => {
  return getSuggestionUserIds(node)[0];
};
