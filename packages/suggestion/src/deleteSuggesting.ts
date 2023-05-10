import {
  createPointRef,
  deleteText,
  findNode,
  getEditorString,
  getPointAfter,
  getPointBefore,
  isRangeAcrossBlocks,
  moveSelection,
  nanoid,
  PlateEditor,
  unhangCharacterRange,
  Value,
  withoutNormalizing,
} from '@udecode/plate-common';
import { Point } from 'slate';
import { MARK_SUGGESTION } from './constants';
import { findSuggestionId } from './findSuggestionId';
import { setSuggestionNodes } from './setSuggestionNodes';
import { TSuggestionText } from './types';

/**
 * Suggest deletion one character at a time until target point is reached.
 * Suggest additions are safely deleted.
 */
export const deleteSuggesting = <V extends Value>(
  editor: PlateEditor<V>,
  from: Point,
  to: Point,
  {
    reverse,
  }: {
    reverse?: boolean;
  } = {}
) => {
  withoutNormalizing(editor, () => {
    const suggestionId = findSuggestionId(editor, from) ?? nanoid();

    const toRef = createPointRef(editor, to);

    let pointCurrent: Point | undefined;
    while (true) {
      pointCurrent = editor.selection?.anchor;
      if (!pointCurrent) break;

      const pointTarget = toRef.current;
      if (!pointTarget) break;

      const str = getEditorString(
        editor,
        reverse
          ? {
              anchor: pointTarget,
              focus: pointCurrent,
            }
          : {
              anchor: pointCurrent,
              focus: pointTarget,
            }
      );
      if (str.length === 0) break;

      const getPoint = reverse ? getPointBefore : getPointAfter;

      const pointNext = getPoint(editor, pointCurrent, {
        unit: 'character',
      });
      if (!pointNext) break;

      let at = reverse
        ? {
            anchor: pointNext,
            focus: pointCurrent,
          }
        : {
            anchor: pointCurrent,
            focus: pointNext,
          };
      at = unhangCharacterRange(editor, at);

      if (isRangeAcrossBlocks(editor, { at })) {
        moveSelection(editor, {
          reverse,
          unit: 'character',
        });
        continue;
      }

      // if the current point is in addition suggestion, delete
      const entryAnchor = findNode<TSuggestionText>(editor, {
        at,
        match: (n) => n[MARK_SUGGESTION] && !n.suggestionDeletion,
      });
      if (entryAnchor) {
        // delete suggestion additions only
        deleteText(editor, { at, unit: 'character' });
        continue;
      }

      setSuggestionNodes(editor, {
        at,
        suggestionDeletion: true,
        suggestionId,
      });
      moveSelection(editor, {
        reverse,
        unit: 'character',
      });
    }
  });
};
