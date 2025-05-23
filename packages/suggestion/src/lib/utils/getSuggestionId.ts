import type { TText } from '@udecode/plate';

import { KEYS } from '@udecode/plate';

import type { TInlineSuggestionData } from '../types';

// the last id is the active id
export const getSuggestionKeyId = (node: TText) => {
  const ids: string[] = Object.keys(node).filter((key) => {
    return key.startsWith(`${KEYS.suggestion}_`);
  });

  return ids.at(-1);
};

export const getInlineSuggestionData = (node: TText) => {
  const keyId = getSuggestionKeyId(node);

  if (!keyId) return;

  return node[keyId] as TInlineSuggestionData | undefined;
};

export const keyId2SuggestionId = (keyId: string) => {
  return keyId.replace(`${KEYS.suggestion}_`, '');
};
