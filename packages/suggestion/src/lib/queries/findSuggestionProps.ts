import { type BaseEditor, nanoid } from '@platejs/core';
import {
  type Element,
  ElementApi,
  type Location,
  type NodeEntry,
  type Point,
} from '@platejs/plite';
import type { TSuggestionElement, TSuggestionText } from '@platejs/utils';

import { BaseSuggestionPlugin } from '../BaseSuggestionPlugin';
import { getInlineSuggestionData, isCurrentUserSuggestion } from '../utils';

export const findSuggestionProps = (
  editor: BaseEditor,
  { at, type }: { at: Location; type: 'insert' | 'remove' | 'update' }
): { id: string; createdAt: number } => {
  const defaultProps = {
    id: nanoid(),
    createdAt: Date.now(),
  };

  const api = editor.plugin(BaseSuggestionPlugin).api;

  const getInlineElementEntry = (point: Point) =>
    editor.read.nodes.above<Element>({
      at: point,
      match: (node) =>
        ElementApi.isElement(node) &&
        editor.read.schema.isInline(node) &&
        !!api.nodeId(node),
    });

  let entry = api.node({
    at,
    isText: true,
  }) as NodeEntry<TSuggestionText> | undefined;
  let inlineEntry: NodeEntry<Element> | undefined;

  if (!entry) {
    const edges = editor.read.ranges.edges(at);

    if (!edges) {
      return defaultProps;
    }

    const [start, end] = edges;

    const nextPoint = editor.read.points.after(end);

    if (nextPoint) {
      entry = api.node({
        at: nextPoint,
        isText: true,
      }) as NodeEntry<TSuggestionText> | undefined;

      if (!entry) {
        inlineEntry = getInlineElementEntry(nextPoint);
      }
    }

    if (!entry && !inlineEntry) {
      const prevPoint = editor.read.points.before(start);

      if (prevPoint) {
        entry = api.node({
          at: prevPoint,
          isText: true,
        }) as NodeEntry<TSuggestionText> | undefined;

        if (!entry) {
          inlineEntry = getInlineElementEntry(prevPoint);
        }
      }

      const blockEntry = editor.read.nodes.block({ at: start });

      // <p>111111<insert_break></p>
      // <p><cursor /></p>
      // in this case we need to find the previous parent node
      if (
        !entry &&
        blockEntry &&
        editor.read.points.isStart(start, blockEntry[1])
      ) {
        const lineBreak = editor.read.nodes.above<TSuggestionElement>({
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
      id: api.nodeId(entry[0]) ?? nanoid(),
      createdAt: getInlineSuggestionData(entry[0])?.createdAt ?? Date.now(),
    };
  }

  const inlineSuggestionData =
    inlineEntry && api.suggestionData(inlineEntry[0]);

  if (
    inlineEntry &&
    inlineSuggestionData?.type === type &&
    isCurrentUserSuggestion(editor, inlineEntry[0] as any)
  ) {
    return {
      id: api.nodeId(inlineEntry[0]) ?? nanoid(),
      createdAt: inlineSuggestionData.createdAt ?? Date.now(),
    };
  }

  return defaultProps;
};
