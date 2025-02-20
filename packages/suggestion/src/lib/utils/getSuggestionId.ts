import type { TText } from '@udecode/plate';

import type { TInlineSuggestionData } from '../types';

import { BaseSuggestionPlugin } from '../BaseSuggestionPlugin';

// the last id is the active id
export const getSuggestionKeyId = (node: TText) => {
  const ids: string[] = Object.keys(node).filter((key) => {
    return key.startsWith(`${BaseSuggestionPlugin.key}_`);
  });

  return ids.at(-1);
};

export const getInlineSuggestionData = (node: TText) => {
  const keyId = getSuggestionKeyId(node);

  if (!keyId) return;

  return node[keyId] as TInlineSuggestionData | undefined;
};

export const keyId2SuggestionId = (keyId: string) => {
  return keyId.replace(`${BaseSuggestionPlugin.key}_`, '');
};
