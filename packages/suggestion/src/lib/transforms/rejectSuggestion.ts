import {
  type BasePlateEditor,
  type TSuggestionElement,
  type TSuggestionText,
  ElementApi,
  KEYS,
  PathApi,
  TextApi,
} from 'platejs';
import type { Text } from '@platejs/plite';

import type { TResolvedSuggestion } from '../types';

import {
  getInlineSuggestionData,
  getSuggestionKey,
  getTransientSuggestionKey,
} from '../utils';
import { getSuggestionApi } from '../utils/getSuggestionApi';

export const rejectSuggestion = (
  editor: BasePlateEditor,
  description: TResolvedSuggestion
) => {
  const suggestionApi = getSuggestionApi(editor);

  editor.update((tx) => {
    const inlineInsertElementEntries = [
      ...editor.api.nodes({
        at: [],
        match: (n) => {
          if (!ElementApi.isElement(n) || !editor.api.isInline(n)) return false;

          const suggestionData = getInlineSuggestionData(n);

          return Boolean(
            suggestionData?.type === 'insert' &&
              suggestionData.id === description.suggestionId
          );
        },
      }),
    ];
    const mergeNodes = [
      ...editor.api.nodes({
        at: [],
        match: (n) => {
          if (!ElementApi.isElement(n)) return false;

          if (suggestionApi.isBlockSuggestion(n)) {
            const suggestionElement = n as TSuggestionElement;
            return Boolean(
              suggestionElement.suggestion.type === 'insert' &&
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
            const node = n as TSuggestionText;
            const suggestionData = getInlineSuggestionData(node);

            if (suggestionData)
              return (
                suggestionData.type === 'remove' &&
                suggestionData.id === description.suggestionId
              );

            return false;
          }
          if (ElementApi.isElement(n) && suggestionApi.isBlockSuggestion(n)) {
            const suggestionElement = n as TSuggestionElement;
            const isLineBreak = suggestionElement.suggestion.isLineBreak;

            if (isLineBreak)
              return (
                suggestionElement.suggestion.id === description.suggestionId
              );

            return (
              suggestionElement.suggestion.type === 'remove' &&
              suggestionElement.suggestion.id === description.suggestionId
            );
          }

          return false;
        },
      }
    );

    tx.nodes.remove({
      at: [],
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

        if (ElementApi.isElement(n) && suggestionApi.isBlockSuggestion(n)) {
          const suggestionElement = n as TSuggestionElement;
          return (
            suggestionElement.suggestion.type === 'insert' &&
            suggestionElement.suggestion.id === description.suggestionId &&
            !suggestionElement.suggestion.isLineBreak
          );
        }

        return false;
      },
    });

    inlineInsertElementEntries.reverse().forEach(([, path]) => {
      tx.nodes.remove({ at: path });
    });

    const updateNodes = [
      ...editor.api.nodes<Text>({
        at: [],
        match: (n) => {
          if (ElementApi.isElement(n)) return false;
          if (TextApi.isText(n)) {
            const datalist = suggestionApi.dataList(n as TSuggestionText);

            if (datalist.length > 0)
              return datalist.some(
                (data) =>
                  data.type === 'update' && data.id === description.suggestionId
              );

            return false;
          }

          return false;
        },
      }),
    ];

    updateNodes.forEach(([node, path]) => {
      const datalist = suggestionApi.dataList(node as TSuggestionText);
      const targetData = datalist.find(
        (data) => data.type === 'update' && data.id === description.suggestionId
      );

      if (!targetData) return;
      if ('newProperties' in targetData) {
        const unsetProps = Object.keys(targetData.newProperties).filter(
          (key) => targetData.newProperties[key]
        );

        tx.nodes.unset([...unsetProps], {
          at: path,
        });
      }
      if ('properties' in targetData) {
        const addProps = Object.keys(targetData.properties).filter(
          (key) => !targetData.properties[key]
        );

        tx.nodes.set(Object.fromEntries(addProps.map((key) => [key, true])), {
          at: path,
        });
      }

      // remove targetData
      const keysToUnset = [getSuggestionKey(targetData.id)];

      if (datalist.length === 1) {
        keysToUnset.push(KEYS.suggestion);
      }

      tx.nodes.unset(keysToUnset, { at: path });
    });

    tx.normalize({ force: true });
  });
};
