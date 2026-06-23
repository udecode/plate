import {
  type SlateEditor,
  type TSuggestionElement,
  type TSuggestionText,
  ElementApi,
  KEYS,
  PathApi,
  TextApi,
} from 'platejs';

import type { TResolvedSuggestion } from '../types';

import { getInlineSuggestionData, getTransientSuggestionKey } from '../utils';
import { getSuggestionApi } from '../utils/getSuggestionApi';

export const acceptSuggestion = (
  editor: SlateEditor,
  description: TResolvedSuggestion
) => {
  const suggestionApi = getSuggestionApi(editor);

  editor.update((tx) => {
    const mergeNodes = [
      ...editor.api.nodes({
        at: [],
        match: (n) => {
          if (!ElementApi.isElement(n)) return false;

          if (suggestionApi.isBlockSuggestion(n)) {
            const suggestionElement = n as TSuggestionElement;
            return (
              suggestionElement.suggestion.type === 'remove' &&
              suggestionElement.suggestion.isLineBreak &&
              suggestionElement.suggestion.id === description.suggestionId
            );
          }

          return false;
        },
      }),
    ];

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
            (ElementApi.isElement(n) && editor.api.isInline(n))
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
      match: (n) => {
        if (
          TextApi.isText(n) ||
          // inline elements like links
          (ElementApi.isElement(n) && editor.api.isInline(n))
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

    tx.normalize({ force: true });
  });
};
