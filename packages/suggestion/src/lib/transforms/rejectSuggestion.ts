import type { BaseEditor } from '@platejs/core';
import { type Text, ElementApi, PathApi, TextApi } from '@platejs/plite';
import {
  type TSuggestionElement,
  type TSuggestionText,
  KEYS,
} from '@platejs/utils';

import type { TResolvedSuggestion } from '../types';

import { BaseSuggestionPlugin } from '../BaseSuggestionPlugin';
import { SuggestionUpdatePolicy } from '../update-policy';
import {
  getInlineSuggestionData,
  getSuggestionKey,
  getTransientSuggestionKey,
} from '../utils';

export const rejectSuggestion = (
  editor: BaseEditor,
  description: TResolvedSuggestion
) => {
  editor.update(SuggestionUpdatePolicy.skip, (tx) => {
    const suggestionApi = editor.plugin(BaseSuggestionPlugin).api;
    const inlineInsertElementEntries = editor.read.nodes.toArray({
      at: [],
      match: (n) => {
        if (!ElementApi.isElement(n) || !editor.read.schema.isInline(n)) {
          return false;
        }

        const suggestionData = getInlineSuggestionData(n);

        return Boolean(
          suggestionData?.type === 'insert' &&
            suggestionData.id === description.suggestionId
        );
      },
    });
    const mergeNodes = editor.read.nodes.toArray({
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

    const updateNodes = editor.read.nodes.toArray<Text>({
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
    });

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
      tx.nodes.unset([getSuggestionKey(targetData.id)], {
        at: path,
      });
    });

    tx.normalize({ force: false });
  });
};
