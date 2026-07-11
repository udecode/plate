import type { BaseEditor } from '@platejs/core';
import { ElementApi, PathApi, TextApi } from '@platejs/plite';
import {
  type TSuggestionElement,
  type TSuggestionText,
  KEYS,
} from '@platejs/utils';

import type { TResolvedSuggestion } from '../types';

import { BaseSuggestionPlugin } from '../BaseSuggestionPlugin';
import { getInlineSuggestionData, getTransientSuggestionKey } from '../utils';

export const acceptSuggestion = (
  editor: BaseEditor,
  description: TResolvedSuggestion
) => {
  editor.update((tx) => {
    const suggestionApi = editor.plugin(BaseSuggestionPlugin).api;
    const mergeNodes = editor.read.nodes.toArray({
      at: [],
      match: (n) => {
        if (!ElementApi.isElement(n)) return false;

        if (suggestionApi.isBlockSuggestion(n)) {
          const suggestionElement = n as TSuggestionElement;
          return Boolean(
            suggestionElement.suggestion.type === 'remove' &&
              suggestionElement.suggestion.isLineBreak &&
              suggestionElement.suggestion.id === description.suggestionId
          );
        }

        return false;
      },
    });

    mergeNodes.reverse().forEach(([, path]) => {
      tx.nodes.merge({ at: PathApi.next(path) });
    });

    tx.nodes.unset(
      [description.keyId, KEYS.suggestion, getTransientSuggestionKey()],
      {
        at: [],
        mode: 'all',
        match: (n) => {
          if (
            TextApi.isText(n) ||
            (ElementApi.isElement(n) && editor.read.schema.isInline(n))
          ) {
            const suggestionDataList = suggestionApi.dataList(
              n as TSuggestionText
            );
            const includeUpdate = suggestionDataList.some(
              (data) => data.type === 'update'
            );

            if (includeUpdate) {
              return suggestionDataList.some(
                (d) => d.id === description.suggestionId
              );
            }
            const suggestionData = getInlineSuggestionData(n);

            if (suggestionData)
              return (
                suggestionData.type === 'insert' &&
                suggestionData.id === description.suggestionId
              );

            return false;
          }
          if (ElementApi.isElement(n) && suggestionApi.isBlockSuggestion(n)) {
            const suggestionElement = n as TSuggestionElement;
            const suggestionData = suggestionElement.suggestion;

            if (suggestionData) {
              const isLineBreak = suggestionData.isLineBreak;

              if (isLineBreak)
                return suggestionData.id === description.suggestionId;

              return (
                suggestionData.type === 'insert' &&
                suggestionData.id === description.suggestionId
              );
            }
          }

          return false;
        },
      }
    );

    tx.nodes.remove({
      at: [],
      mode: 'all',
      match: (n) => {
        if (
          TextApi.isText(n) ||
          // inline elements like links
          (ElementApi.isElement(n) && editor.read.schema.isInline(n))
        ) {
          const suggestionData = getInlineSuggestionData(n);

          if (suggestionData) {
            return (
              suggestionData.type === 'remove' &&
              suggestionData.id === description.suggestionId
            );
          }

          return false;
        }

        if (ElementApi.isElement(n) && suggestionApi.isBlockSuggestion(n)) {
          const suggestionElement = n as TSuggestionElement;
          const suggestionData = suggestionElement.suggestion;

          if (suggestionData) {
            const isLineBreak = suggestionData.isLineBreak;

            return (
              suggestionData.type === 'remove' &&
              suggestionData.id === description.suggestionId &&
              !isLineBreak
            );
          }
        }

        return false;
      },
    });

    tx.normalize({ force: false });
  });
};
