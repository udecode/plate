import { type SlateEditor, ElementApi, PathApi, TextApi } from '@udecode/plate';

import type { TResolvedSuggestion } from '../types';

import { BaseSuggestionPlugin } from '../BaseSuggestionPlugin';
import {
  getInlineSuggestionData,
  getInlineSuggestionDataList,
  getSuggestionData,
  isSuggestionElement,
} from '../utils';

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

          const lineBreakData = getSuggestionData(n);

          if (lineBreakData)
            return (
              lineBreakData.type === 'remove' &&
              lineBreakData.isLineBreak &&
              lineBreakData.id === description.suggestionId
            );

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
          const suggestionDataList = getInlineSuggestionDataList(n);
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
        if (isSuggestionElement(n)) {
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

        if (isSuggestionElement(n)) {
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
