import type { Element, Text } from '@platejs/slate';
import type { TInlineSuggestionData } from 'platejs';

import { KEYS } from 'platejs';

// the last id is the active id
export const getSuggestionKeyId = (node: Element | Text) => {
  const ids: string[] = Object.keys(node).filter((key) =>
    key.startsWith(`${KEYS.suggestion}_`)
  );

  return ids.at(-1);
};

export const getInlineSuggestionData = (node: Element | Text) => {
  const keyId = getSuggestionKeyId(node);

  if (!keyId) return;

  return node[keyId] as TInlineSuggestionData | undefined;
};

export const keyId2SuggestionId = (keyId: string) =>
  keyId.replace(`${KEYS.suggestion}_`, '');
