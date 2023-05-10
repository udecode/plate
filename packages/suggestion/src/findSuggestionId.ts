import {
  findNode,
  getEdgePoints,
  getPointAfter,
  getPointBefore,
  PlateEditor,
  Value,
} from '@udecode/plate-common';
import { Location } from 'slate';
import { KEY_SUGGESTION_ID, MARK_SUGGESTION } from './constants';
import { TSuggestionText } from './types';

/**
 * Find the suggestion id at the cursor point, the point before and after (if offset = 0).
 */
export const findSuggestionId = <V extends Value>(
  editor: PlateEditor<V>,
  at: Location
) => {
  let entry = findNode<TSuggestionText>(editor, {
    at,
    match: (n) => n[MARK_SUGGESTION],
  });
  if (!entry) {
    const [start, end] = getEdgePoints(editor, at);

    const nextPoint = getPointAfter(editor, end);
    if (nextPoint) {
      entry = findNode<TSuggestionText>(editor, {
        at: nextPoint,
        match: (n) => n[MARK_SUGGESTION],
      });
      if (!entry) {
        const prevPoint = getPointBefore(editor, start);
        if (prevPoint) {
          entry = findNode<TSuggestionText>(editor, {
            at: prevPoint,
            match: (n) => n[MARK_SUGGESTION],
          });
        }
      }
    }
  }

  if (entry) {
    return entry[0][KEY_SUGGESTION_ID];
  }
};
