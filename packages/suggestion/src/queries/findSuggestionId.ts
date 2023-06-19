import {
  getEdgePoints,
  getPointAfter,
  getPointBefore,
  PlateEditor,
  Value,
} from '@udecode/plate-common';
import { Location, Point } from 'slate';
import { KEY_SUGGESTION_ID } from '../constants';
import { findSuggestionNode } from './findSuggestionNode';

/**
 * Find the suggestion id at the cursor point, the point before and after (if offset = 0).
 */
export const findSuggestionId = <V extends Value>(
  editor: PlateEditor<V>,
  at: Location
) => {
  let entry = findSuggestionNode(editor, {
    at,
  });
  if (!entry) {
    let start: Point;
    let end: Point;
    try {
      [start, end] = getEdgePoints(editor, at);
    } catch (err) {
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
