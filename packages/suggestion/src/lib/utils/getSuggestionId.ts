import {
  type TElement,
  type TNode,
  type TText,
  ElementApi,
  TextApi,
} from '@udecode/plate';

import type { TSuggestionData, TSuggestionLineBreak } from '../types';

import { BaseSuggestionPlugin, SUGGESTION_KEYS } from '../BaseSuggestionPlugin';

// the last id is the active id
export const getSuggestionKeyId = (node: TText) => {
  const ids = Object.keys(node).filter((key) => {
    return key.startsWith(`${BaseSuggestionPlugin.key}_`);
  });

  return ids.at(-1);
};

export const getAllSuggestionId = (node: TNode) => {
  if (TextApi.isText(node)) {
    return getSuggestionId(node);
  }
  if (ElementApi.isElement(node)) {
    return getSuggestionLineBreakId(node);
  }
};

export const getAllSuggestionData = (
  node: TNode
): TSuggestionData | TSuggestionLineBreak | undefined => {
  if (TextApi.isText(node)) {
    return getSuggestionData(node);
  }
  if (ElementApi.isElement(node)) {
    return getSuggestionLineBreakData(node);
  }
};

export const getSuggestionId = (node: TText) => {
  const keyId = getSuggestionKeyId(node);

  if (!keyId) return;

  return keyId.replace(`${BaseSuggestionPlugin.key}_`, '');
};

export const getSuggestionData = (node: TText) => {
  const keyId = getSuggestionKeyId(node);

  if (!keyId) return;

  return node[keyId] as TSuggestionData | undefined;
};

export const getSuggestionLineBreakData = (node: TElement) => {
  return node[SUGGESTION_KEYS.lineBreak] as TSuggestionLineBreak | undefined;
};

export const getSuggestionLineBreakId = (node: TElement) => {
  return getSuggestionLineBreakData(node)?.id;
};

export const getSuggestionDataList = (node: TText) => {
  return Object.keys(node)
    .filter((key) => {
      return key.startsWith(`${BaseSuggestionPlugin.key}_`);
    })
    .map((key) => node[key] as TSuggestionData);
};

export const keyId2SuggestionId = (keyId: string) => {
  return keyId.replace(`${BaseSuggestionPlugin.key}_`, '');
};
