import { type SlateEditor, ElementApi, PathApi, TextApi } from '@udecode/plate';

import type { TResolvedSuggestion } from '../types';

import { SUGGESTION_KEYS } from '../BaseSuggestionPlugin';
import {
  getSuggestionData,
  getSuggestionDataList,
  getSuggestionLineBreakData,
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

          const lineBreakData = getSuggestionLineBreakData(n);

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

    editor.tf.unsetNodes([description.keyId, SUGGESTION_KEYS.lineBreak], {
      at: [],
      mode: 'all',
      match: (n) => {
        if (TextApi.isText(n)) {
          const suggestionDataList = getSuggestionDataList(n);
          const includeUpdate = suggestionDataList.some(
            (data) => data.type === 'update'
          );

          if (includeUpdate) {
            return suggestionDataList.some(
              (d) => d.id === description.suggestionId
            );
          } else {
            const suggestionData = getSuggestionData(n);

            if (suggestionData)
              return (
                suggestionData.type === 'insert' &&
                suggestionData.id === description.suggestionId
              );
          }

          return false;
        }
        if (ElementApi.isElement(n)) {
          const lineBreakData = getSuggestionLineBreakData(n);

          if (lineBreakData) {
            const isLineBreak = lineBreakData.isLineBreak;

            if (isLineBreak)
              return lineBreakData.id === description.suggestionId;

            return (
              lineBreakData.type === 'insert' &&
              lineBreakData.id === description.suggestionId
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
          const suggestionData = getSuggestionData(n);

          if (suggestionData) {
            return (
              suggestionData.type === 'remove' &&
              suggestionData.id === description.suggestionId
            );
          }

          return false;
        }

        if (ElementApi.isElement(n)) {
          const lineBreakData = getSuggestionLineBreakData(n);

          if (lineBreakData)
            return (
              lineBreakData.type === 'remove' &&
              lineBreakData.id === description.suggestionId &&
              !lineBreakData.isLineBreak
            );
        }

        return false;
      },
    });
  });
};
