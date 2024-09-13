import type { Location, Point } from 'slate';

import {
  type SlateEditor,
  getEdgePoints,
  getPointAfter,
  getPointBefore,
} from '@udecode/plate-common';

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
      [start, end] = getEdgePoints(editor, at);
    } catch {
      return;
    }

    const nextPoint = getPointAfter(editor, end);

    if (nextPoint) {
      entry = findSuggestionNode(editor, {
        at: nextPoint,
      });

      if (!entry) {
        const prevPoint = getPointBefore(editor, start);

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
