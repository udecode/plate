import {
  type NodeEntry,
  type Point,
  type SlateEditor,
  type TLocation,
  nanoid,
} from '@udecode/plate';

import type { TSuggestionElement, TSuggestionText } from '../types';

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

  let entry = api.suggestion.node({
    at,
    isText: true,
  }) as NodeEntry<TSuggestionText> | undefined;

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
        const prevPoint = editor.api.before(start);

        if (prevPoint) {
          entry = api.suggestion.node({
            at: prevPoint,
            isText: true,
          }) as NodeEntry<TSuggestionText> | undefined;
        }
        // <p>111111<insert_break></p>
        // <p><cursor /></p>
        // in this case we need to find the previous parent node
        // TODO: test
        if (!entry && editor.api.isStart(start, at)) {
          const _at = prevPoint ?? at;

          const lineBreak = editor.api.above<TSuggestionElement>({ at: _at });

          const lineBreakData = lineBreak?.[0].suggestion;

          if (lineBreakData?.isLineBreak) {
            return {
              id: lineBreakData?.id ?? nanoid(),
              createdAt: lineBreakData?.createdAt ?? Date.now(),
            };
          }
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

  return defaultProps;
};
