import {
  type SlateEditor,
  type TText,
  ElementApi,
  PathApi,
  TextApi,
} from '@udecode/plate';

import type { TResolvedSuggestion, TSuggestionText } from '../types';

import { BaseSuggestionPlugin } from '../BaseSuggestionPlugin';
import { getInlineSuggestionData, getSuggestionKey } from '../utils';

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

          if (
            editor.getApi(BaseSuggestionPlugin).suggestion.isBlockSuggestion(n)
          ) {
            return (
              n.suggestion.type === 'insert' &&
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
          const node = n as TSuggestionText;
          const suggestionData = getInlineSuggestionData(node);

          if (suggestionData)
            return (
              suggestionData.type === 'remove' &&
              suggestionData.id === description.suggestionId
            );

          return false;
        }
        if (
          ElementApi.isElement(n) &&
          editor.getApi(BaseSuggestionPlugin).suggestion.isBlockSuggestion(n)
        ) {
          const isLineBreak = n.suggestion.isLineBreak;

          if (isLineBreak) return n.suggestion.id === description.suggestionId;

          return (
            n.suggestion.type === 'remove' &&
            n.suggestion.id === description.suggestionId
          );
        }

        return false;
      },
    });

    editor.tf.removeNodes({
      at: [],
      mode: 'all',
      match: (n) => {
        if (TextApi.isText(n)) {
          const node = n as TSuggestionText;

          const suggestionData = getInlineSuggestionData(node);

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
          return (
            n.suggestion.type === 'insert' &&
            n.suggestion.id === description.suggestionId &&
            !n.suggestion.isLineBreak
          );
        }

        return false;
      },
    });

    const updateNodes = [
      ...editor.api.nodes<TText>({
        at: [],
        match: (n) => {
          if (ElementApi.isElement(n)) return false;
          if (TextApi.isText(n)) {
            const datalist = editor
              .getApi(BaseSuggestionPlugin)
              .suggestion.dataList(n as TSuggestionText);

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
      const datalist = editor
        .getApi(BaseSuggestionPlugin)
        .suggestion.dataList(node as TSuggestionText);
      const targetData = datalist.find(
        (data) => data.type === 'update' && data.id === description.suggestionId
      );

      if (!targetData) return;
      if ('newProperties' in targetData) {
        const unsetProps = Object.keys(targetData.newProperties).filter(
          (key) => targetData.newProperties[key]
        );

        editor.tf.unsetNodes([...unsetProps], {
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

      // remove targetData
      editor.tf.unsetNodes([getSuggestionKey(targetData.id)], {
        at: path,
      });
    });
  });
};
