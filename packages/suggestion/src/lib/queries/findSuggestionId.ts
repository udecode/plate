import type { SlateEditor } from '@udecode/plate-common';
import type { Location, Point } from 'slate';

import { SUGGESTION_KEYS } from '../BaseSuggestionPlugin';
import { findSuggestionNode } from './findSuggestionNode';

/**
 * Find the suggestion id at the cursor point, the point before and after (if
 * offset = 0).
 */
export const findSuggestionId = (editor: SlateEditor, at: Location) => {
  let entry = findSuggestionNode(editor, {
    at,
  });

  if (!entry) {
    let start: Point;
    let end: Point;

    try {
      [start, end] = editor.api.edges(at)!;
    } catch {
      return;
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
      }
    }
  }
  if (entry) {
    return entry[0][SUGGESTION_KEYS.id];
  }
};
