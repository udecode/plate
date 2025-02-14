import {
  type Point,
  type SlateEditor,
  type TElement,
  type TLocation,
  nanoid,
} from '@udecode/plate';

import {
  getSuggestionData,
  getSuggestionId,
  getSuggestionLineBreakData,
  isCurrentUserSuggestion,
} from '../utils';
import { findSuggestionNode } from './findSuggestionNode';

export const findSuggestionProps = (
  editor: SlateEditor,
  { at, type }: { at: TLocation; type: 'insert' | 'remove' | 'update' }
): { id: string; createdAt: number } => {
  const defaultProps = {
    id: nanoid(),
    createdAt: Date.now(),
  };

  let entry = findSuggestionNode(editor, {
    at,
  });

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
      entry = findSuggestionNode(editor, {
        at: nextPoint,
      });

      if (!entry) {
        const prevPoint = editor.api.before(start);

        if (prevPoint) {
          entry = findSuggestionNode(editor, {
            at: prevPoint,
          });
        }
        // <p>111111<insert_break></p>
        // <p><cursor /></p>
        // in this case we need to find the previous parent node
        // TODO: test
        if (!entry && editor.api.isStart(start, at)) {
          const _at = prevPoint ?? at;

          const lineBreak = editor.api.above<TElement>({ at: _at });

          const lineBreakData =
            lineBreak && getSuggestionLineBreakData(lineBreak?.[0]);

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
    getSuggestionData(entry[0])?.type === type &&
    isCurrentUserSuggestion(editor, entry[0])
  ) {
    return {
      id: getSuggestionId(entry[0]) ?? nanoid(),
      createdAt: getSuggestionData(entry[0])?.createdAt ?? Date.now(),
    };
  }

  return defaultProps;
};
