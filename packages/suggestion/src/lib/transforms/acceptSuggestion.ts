import { type SlateEditor, ElementApi, PathApi, TextApi } from '@udecode/plate';

import type { TResolvedSuggestion, TSuggestionText } from '../types';

import { BaseSuggestionPlugin } from '../BaseSuggestionPlugin';
import { getInlineSuggestionData } from '../utils';

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
            return (
              n.suggestion.type === 'remove' &&
              n.suggestion.isLineBreak &&
              n.suggestion.id === description.suggestionId
            );
          }

          return false;
        },
      }),
    ];

    mergeNodes.reverse().forEach(([, path]) => {
      editor.tf.mergeNodes({ at: PathApi.next(path) });
    });

    editor.tf.unsetNodes([description.keyId, BaseSuggestionPlugin.key], {
      at: [],
      mode: 'all',
      match: (n) => {
        if (TextApi.isText(n)) {
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
          } else {
            const suggestionData = getInlineSuggestionData(n);

            if (suggestionData)
              return (
                suggestionData.type === 'insert' &&
                suggestionData.id === description.suggestionId
              );
          }

          return false;
        }
        if (
          ElementApi.isElement(n) &&
          editor.getApi(BaseSuggestionPlugin).suggestion.isBlockSuggestion(n)
        ) {
          const suggestionData = n.suggestion;

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
    });

    editor.tf.removeNodes({
      at: [],
      mode: 'all',
      match: (n) => {
        if (TextApi.isText(n)) {
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
          const suggestionData = n.suggestion;

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
