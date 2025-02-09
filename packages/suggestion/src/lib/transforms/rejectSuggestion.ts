import {
  type SlateEditor,
  type TText,
  ElementApi,
  PathApi,
  TextApi,
} from '@udecode/plate';

import type { TResolvedSuggestion, TSuggestionText } from '../types';

import { SUGGESTION_KEYS } from '../BaseSuggestionPlugin';
import {
  getSuggestionData,
  getSuggestionDataList,
  getSuggestionKey,
  getSuggestionLineBreakData,
} from '../utils';

export const rejectSuggestion = (
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
              lineBreakData.type === 'insert' &&
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
          const node = n as TSuggestionText;
          const suggestionData = getSuggestionData(node);

          if (suggestionData)
            return (
              suggestionData.type === 'remove' &&
              suggestionData.id === description.suggestionId
            );

          return false;
        }
        if (ElementApi.isElement(n)) {
          const lineBreakData = getSuggestionLineBreakData(n);

          if (lineBreakData)
            return lineBreakData.id === description.suggestionId;
        }

        return false;
      },
    });

    editor.tf.removeNodes({
      at: [],
      match: (n) => {
        const node = n as TSuggestionText;

        const suggestionData = getSuggestionData(node);

        if (suggestionData)
          return (
            suggestionData.type === 'insert' &&
            suggestionData.id === description.suggestionId
          );

        return false;
      },
    });

    const updateNodes = [
      ...editor.api.nodes<TText>({
        at: [],
        match: (n) => {
          if (ElementApi.isElement(n)) return false;
          if (TextApi.isText(n)) {
            const datalist = getSuggestionDataList(n);

            if (datalist.length > 0)
              return datalist.some(
                (data) =>
                  data.type === 'update' && data.id === description.suggestionId
              );

            return false;
          }
        },
      }),
    ];

    updateNodes.forEach(([node, path]) => {
      const datalist = getSuggestionDataList(node);
      const targetData = datalist.find(
        (data) => data.type === 'update' && data.id === description.suggestionId
      );

      if (!targetData) return;
      if ('newProperties' in targetData) {
        const unsetProps = Object.keys(targetData.newProperties).filter(
          (key) => targetData.newProperties[key]
        );

        editor.tf.unsetNodes([...unsetProps, getSuggestionKey(targetData.id)], {
          at: path,
        });
      }
      if ('properties' in targetData) {
        const addProps = Object.keys(targetData.properties).filter(
          (key) => !targetData.properties[key]
        );

        editor.tf.setNodes(
          Object.fromEntries(addProps.map((key) => [key, true])),
          {
            at: path,
          }
        );
      }
    });
  });
};
