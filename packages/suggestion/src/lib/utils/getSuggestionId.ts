import {
  type TElement,
  type TNode,
  type TText,
  ElementApi,
  TextApi,
} from '@udecode/plate';

import type { TInlineSuggestionData, TSuggestionElement } from '../types';

import { BaseSuggestionPlugin } from '../BaseSuggestionPlugin';

// the last id is the active id
export const getSuggestionKeyId = (node: TText) => {
  const ids = Object.keys(node).filter((key) => {
    return key.startsWith(`${BaseSuggestionPlugin.key}_`);
  });

  return ids.at(-1);
};

export const getAllSuggestionId = (node: TNode) => {
  if (TextApi.isText(node)) {
    return getInlineSuggestionId(node);
  }
  if (ElementApi.isElement(node)) {
    return getSuggestionId(node);
  }
};

export const getAllSuggestionData = (
  node: TNode
): TInlineSuggestionData | TSuggestionElement['suggestion'] | undefined => {
  if (TextApi.isText(node)) {
    return getInlineSuggestionData(node);
  }
  if (isSuggestionElement(node)) {
    return node.suggestion;
  }
};

export const getInlineSuggestionId = (node: TText) => {
  const keyId = getSuggestionKeyId(node);

  if (!keyId) return;

  return keyId.replace(`${BaseSuggestionPlugin.key}_`, '');
};

export const getInlineSuggestionData = (node: TText) => {
  const keyId = getSuggestionKeyId(node);

  if (!keyId) return;

  return node[keyId] as TInlineSuggestionData | undefined;
};

export const getSuggestionData = (node: TElement) => {
  if (isSuggestionElement(node)) {
    return node.suggestion;
  }
};

export const isSuggestionElement = (node: TNode): node is TSuggestionElement =>
  ElementApi.isElement(node) && 'suggestion' in node;

export const getSuggestionId = (node: TElement) => {
  return getSuggestionData(node)?.id;
};

export const getInlineSuggestionDataList = (node: TText) => {
  return Object.keys(node)
    .filter((key) => {
      return key.startsWith(`${BaseSuggestionPlugin.key}_`);
    })
    .map((key) => node[key] as TInlineSuggestionData);
};

export const keyId2SuggestionId = (keyId: string) => {
  return keyId.replace(`${BaseSuggestionPlugin.key}_`, '');
};
