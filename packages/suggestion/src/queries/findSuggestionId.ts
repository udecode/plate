import type { Location, Point } from 'slate';

import {
  type PlateEditor,
  getEdgePoints,
  getPointAfter,
  getPointBefore,
} from '@udecode/plate-common/server';

import { KEY_SUGGESTION_ID } from '../constants';
import { findSuggestionNode } from './findSuggestionNode';

/**
 * Find the suggestion id at the cursor point, the point before and after (if
 * offset = 0).
 */
export const findSuggestionId = (editor: PlateEditor, at: Location) => {
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
    return entry[0][KEY_SUGGESTION_ID];
  }
};
