import {
  ElementApi,
  type NodeEntry,
  type SlateEditor,
  type TSuggestionElement,
  type TSuggestionText,
  nanoid,
} from 'platejs';
import type { Element, Location, Point } from '@platejs/slate';

import { getInlineSuggestionData, isCurrentUserSuggestion } from '../utils';
import { getSuggestionApi } from '../utils/getSuggestionApi';

export const findSuggestionProps = (
  editor: SlateEditor,
  { at, type }: { at: Location; type: 'insert' | 'remove' | 'update' }
): { id: string; createdAt: number } => {
  const defaultProps = {
    id: nanoid(),
    createdAt: Date.now(),
  };

  const suggestionApi = getSuggestionApi(editor);

  const getInlineElementEntry = (point: Point) =>
    editor.api.above<Element>({
      at: point,
      match: (node) =>
        ElementApi.isElement(node) &&
        editor.api.isInline(node) &&
        !!suggestionApi.nodeId(node),
    });

  let entry = suggestionApi.node({
    at,
    isText: true,
  }) as NodeEntry<TSuggestionText> | undefined;
  let inlineEntry: NodeEntry<Element> | undefined;

  if (!entry) {
    let start: Point;
    let end: Point;

    try {
      const rangesApi = editor.api as typeof editor.api & {
        ranges?: { edges?: NonNullable<typeof editor.api.edges> };
      };

      const edges = editor.api.edges?.(at) ?? rangesApi.ranges?.edges?.(at);

      if (!edges) return defaultProps;

      [start, end] = edges;
    } catch {
      return defaultProps;
    }

    const nextPoint = editor.api.after(end);

    if (nextPoint) {
      entry = suggestionApi.node({
        at: nextPoint,
        isText: true,
      }) as NodeEntry<TSuggestionText> | undefined;

      if (!entry) {
        inlineEntry = getInlineElementEntry(nextPoint);
      }
    }

    if (!entry && !inlineEntry) {
      const prevPoint = editor.api.before(start);

      if (prevPoint) {
        entry = suggestionApi.node({
          at: prevPoint,
          isText: true,
        }) as NodeEntry<TSuggestionText> | undefined;

        if (!entry) {
          inlineEntry = getInlineElementEntry(prevPoint);
        }
      }

      const blockEntry = editor.api.block({ at: start });

      // <p>111111<insert_break></p>
      // <p><cursor /></p>
      // in this case we need to find the previous parent node
      if (!entry && blockEntry && editor.api.isStart(start, blockEntry[1])) {
        const lineBreak = editor.api.above<TSuggestionElement>({
          at: prevPoint ?? start,
        });

        const lineBreakData = lineBreak?.[0].suggestion;

        if (lineBreakData?.isLineBreak) {
          return {
            id: lineBreakData.id ?? nanoid(),
            createdAt: lineBreakData.createdAt ?? Date.now(),
          };
        }
      }
    }
  }
  // same type and same user merge suggestions
  if (
    entry &&
    getInlineSuggestionData(entry[0])?.type === type &&
    isCurrentUserSuggestion(editor, entry[0])
  ) {
    return {
      id: suggestionApi.nodeId(entry[0]) ?? nanoid(),
      createdAt: getInlineSuggestionData(entry[0])?.createdAt ?? Date.now(),
    };
  }

  const inlineSuggestionData =
    inlineEntry && suggestionApi.suggestionData(inlineEntry[0]);

  if (
    inlineEntry &&
    inlineSuggestionData?.type === type &&
    isCurrentUserSuggestion(editor, inlineEntry[0])
  ) {
    return {
      id: suggestionApi.nodeId(inlineEntry[0]) ?? nanoid(),
      createdAt: inlineSuggestionData.createdAt ?? Date.now(),
    };
  }

  return defaultProps;
};
