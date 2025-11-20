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

import { BaseSuggestionPlugin } from '../BaseSuggestionPlugin';
import { getInlineSuggestionData, getTransientSuggestionKey } from '../utils';

export const acceptSuggestion = (
  editor: SlateEditor,
  description: TResolvedSuggestion
) => {
  editor.tf.withoutNormalizing(() => {
    const mergeNodes = [
      ...editor.api.nodes({
        at: [],
        match: (n) => {
          if (!ElementApi.isElement(n)) return false;

          if (
            editor.getApi(BaseSuggestionPlugin).suggestion.isBlockSuggestion(n)
          ) {
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
      editor.tf.mergeNodes({ at: PathApi.next(path) });
    });

    editor.tf.unsetNodes(
      [description.keyId, KEYS.suggestion, getTransientSuggestionKey()],
      {
        at: [],
        mode: 'all',
        match: (n) => {
          if (
            TextApi.isText(n) ||
            (ElementApi.isElement(n) && editor.api.isInline(n))
          ) {
            const suggestionDataList = editor
              .getApi(BaseSuggestionPlugin)
              .suggestion.dataList(n as TSuggestionText);
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
          if (
            ElementApi.isElement(n) &&
            editor.getApi(BaseSuggestionPlugin).suggestion.isBlockSuggestion(n)
          ) {
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

    editor.tf.removeNodes({
      at: [],
      mode: 'all',
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

        if (
          ElementApi.isElement(n) &&
          editor.getApi(BaseSuggestionPlugin).suggestion.isBlockSuggestion(n)
        ) {
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
  });
};
