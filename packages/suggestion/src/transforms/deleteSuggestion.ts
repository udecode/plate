import {
  createPointRef,
  deleteText,
  findNode,
  getEditorString,
  getPointAfter,
  getPointBefore,
  isBlock,
  isElementEmpty,
  isRangeAcrossBlocks,
  isStartPoint,
  moveSelection,
  nanoid,
  PlateEditor,
  removeNodes,
  TElement,
  unhangCharacterRange,
  Value,
  withoutNormalizing,
} from '@udecode/plate-common';
import { Point, Range } from 'slate';

import { MARK_SUGGESTION } from '../constants';
import { findSuggestionId } from '../queries/findSuggestionId';
import { findSuggestionNode } from '../queries/index';
import { getSuggestionCurrentUserKey } from './getSuggestionProps';
import { setSuggestionNodes } from './setSuggestionNodes';

/**
 * Suggest deletion one character at a time until target point is reached.
 * Suggest additions are safely deleted.
 */
export const deleteSuggestion = <V extends Value>(
  editor: PlateEditor<V>,
  at: Range,
  {
    reverse,
  }: {
    reverse?: boolean;
  } = {}
) => {
  withoutNormalizing(editor, () => {
    const { anchor: from, focus: to } = at;

    const suggestionId = findSuggestionId(editor, from) ?? nanoid();

    const toRef = createPointRef(editor, to);

    let pointCurrent: Point | undefined;
    while (true) {
      pointCurrent = editor.selection?.anchor;
      if (!pointCurrent) break;

      const pointTarget = toRef.current;
      if (!pointTarget) break;

      // don't delete across blocks
      if (
        !isRangeAcrossBlocks(editor, {
          at: { anchor: pointCurrent, focus: pointTarget },
        })
      ) {
        // always 0 when across blocks
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
      }

      const getPoint = reverse ? getPointBefore : getPointAfter;

      const pointNext = getPoint(editor, pointCurrent, {
        unit: 'character',
      });
      if (!pointNext) break;

      let range = reverse
        ? {
            anchor: pointNext,
            focus: pointCurrent,
          }
        : {
            anchor: pointCurrent,
            focus: pointNext,
          };
      range = unhangCharacterRange(editor, range);

      // if the current point is in block addition suggestion, delete block
      const entryBlock = findNode<TElement>(editor, {
        at: pointCurrent,
        match: (n) =>
          isBlock(editor, n) &&
          n[MARK_SUGGESTION] &&
          !n.suggestionDeletion &&
          n[getSuggestionCurrentUserKey(editor)],
      });

      if (
        entryBlock &&
        isStartPoint(editor, pointCurrent, entryBlock[1]) &&
        isElementEmpty(editor, entryBlock[0] as any)
      ) {
        removeNodes(editor, {
          at: entryBlock[1],
        });
        continue;
      }

      // move selection if still the same
      if (Point.equals(pointCurrent, editor.selection!.anchor)) {
        moveSelection(editor, {
          reverse,
          unit: 'character',
        });
      }

      // skip if the range is across blocks
      if (
        isRangeAcrossBlocks(editor, {
          at: range,
        })
      ) {
        continue;
      }

      // if the current point is in addition suggestion, delete
      const entryText = findSuggestionNode(editor, {
        at: range,
        match: (n) =>
          !n.suggestionDeletion && n[getSuggestionCurrentUserKey(editor)],
      });
      if (entryText) {
        deleteText(editor, { at: range, unit: 'character' });
        continue;
      }

      setSuggestionNodes(editor, {
        at: range,
        suggestionDeletion: true,
        suggestionId,
      });
    }
  });
};
