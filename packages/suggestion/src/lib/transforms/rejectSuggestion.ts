import {
  type SlateEditor,
  type TSuggestionElement,
  type TSuggestionText,
  type TText,
  ElementApi,
  KEYS,
  PathApi,
  TextApi,
} from 'platejs';

import type { TResolvedSuggestion } from '../types';

import { BaseSuggestionPlugin } from '../BaseSuggestionPlugin';
import {
  getInlineSuggestionData,
  getSuggestionKey,
  getTransientSuggestionKey,
} from '../utils';

const ENDS_WITH_WHITESPACE_RE = /\s$/;
const STARTS_WITH_WHITESPACE_RE = /^\s/;

export const rejectSuggestion = (
  editor: SlateEditor,
  description: TResolvedSuggestion
) => {
  editor.tf.withoutNormalizing(() => {
    const inlineInsertElementEntries = [
      ...editor.api.nodes({
        at: [],
        match: (n) => {
          if (!ElementApi.isElement(n) || !editor.api.isInline(n)) return false;

          const suggestionData = getInlineSuggestionData(n);

          return (
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

          if (
            editor.getApi(BaseSuggestionPlugin).suggestion.isBlockSuggestion(n)
          ) {
            const suggestionElement = n as TSuggestionElement;
            return (
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
      const previousPath = path.at(-1)! > 0 ? PathApi.previous(path) : null;
      const nextPath = PathApi.next(path);
      const previousEntry = previousPath ? editor.api.node(previousPath) : null;
      const nextEntry = editor.api.node(nextPath);
      const trimOffset =
        previousPath &&
        previousEntry &&
        nextEntry &&
        TextApi.isText(previousEntry[0]) &&
        TextApi.isText(nextEntry[0]) &&
        ENDS_WITH_WHITESPACE_RE.test(previousEntry[0].text) &&
        STARTS_WITH_WHITESPACE_RE.test(nextEntry[0].text)
          ? 0
          : null;

      editor.tf.removeNodes({ at: path });

      if (trimOffset === null) return;

      const nextEntryAfterRemoval = editor.api.node(path);

      if (!nextEntryAfterRemoval || !TextApi.isText(nextEntryAfterRemoval[0]))
        return;

      const start = editor.api.start(path);
      const end = start && editor.api.after(start);
      const range = start && end && editor.api.range(start, end);

      if (range) {
        editor.tf.delete({ at: range });
      }
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
