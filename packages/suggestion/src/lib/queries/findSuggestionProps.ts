import {
  ElementApi,
  type NodeEntry,
  type Point,
  type SlateEditor,
  type TElement,
  type TLocation,
  type TSuggestionElement,
  type TSuggestionText,
  nanoid,
} from 'platejs';

import { BaseSuggestionPlugin } from '../BaseSuggestionPlugin';
import { getInlineSuggestionData, isCurrentUserSuggestion } from '../utils';

export const findSuggestionProps = (
  editor: SlateEditor,
  { at, type }: { at: TLocation; type: 'insert' | 'remove' | 'update' }
): { id: string; createdAt: number } => {
  const defaultProps = {
    id: nanoid(),
    createdAt: Date.now(),
  };

  const api = editor.getApi(BaseSuggestionPlugin);

  const getInlineElementEntry = (point: Point) =>
    editor.api.above<TElement>({
      at: point,
      match: (node) =>
        ElementApi.isElement(node) &&
        editor.api.isInline(node) &&
        !!api.suggestion.nodeId(node),
    });

  let entry = api.suggestion.node({
    at,
    isText: true,
  }) as NodeEntry<TSuggestionText> | undefined;
  let inlineEntry: NodeEntry<TElement> | undefined;

  if (!entry) {
    let start: Point;
    let end: Point;

    try {
      [start, end] = editor.api.edges(at)!;
    } catch {
      return defaultProps;
    }

    const nextPoint = editor.api.after(end);

    if (nextPoint) {
      entry = api.suggestion.node({
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
        entry = api.suggestion.node({
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
      id: api.suggestion.nodeId(entry[0]) ?? nanoid(),
      createdAt: getInlineSuggestionData(entry[0])?.createdAt ?? Date.now(),
    };
  }

  const inlineSuggestionData =
    inlineEntry && api.suggestion.suggestionData(inlineEntry[0]);

  if (
    inlineEntry &&
    inlineSuggestionData?.type === type &&
    isCurrentUserSuggestion(editor, inlineEntry[0] as any)
  ) {
    return {
      id: api.suggestion.nodeId(inlineEntry[0]) ?? nanoid(),
      createdAt: inlineSuggestionData.createdAt ?? Date.now(),
    };
  }

  return defaultProps;
};
