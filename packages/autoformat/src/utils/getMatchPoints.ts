import { TEditor, Value, getPointBeforeLocation } from '@udecode/plate-common';
import { Point, Range } from 'slate';

import { MatchRange } from '../types';
import { isPreviousCharacterEmpty } from './isPreviousCharacterEmpty';

export type GetMatchPointsReturnType =
  | undefined
  | {
      beforeStartMatchPoint: Point | undefined;
      afterStartMatchPoint: Point | undefined;
      beforeEndMatchPoint: Point;
    };

export const getMatchPoints = <V extends Value>(
  editor: TEditor<V>,
  { start, end }: MatchRange
) => {
  const selection = editor.selection as Range;

  let beforeEndMatchPoint = selection.anchor;
  if (end) {
    beforeEndMatchPoint = getPointBeforeLocation(editor, selection, {
      matchString: end,
    });

    if (!beforeEndMatchPoint) return;
  }

  let afterStartMatchPoint: Point | undefined;
  let beforeStartMatchPoint: Point | undefined;

  if (start) {
    afterStartMatchPoint = getPointBeforeLocation(editor, beforeEndMatchPoint, {
      matchString: start,
      skipInvalid: true,
      afterMatch: true,
    });

    if (!afterStartMatchPoint) return;

    beforeStartMatchPoint = getPointBeforeLocation(
      editor,
      beforeEndMatchPoint,
      {
        matchString: start,
        skipInvalid: true,
      }
    );

    if (!isPreviousCharacterEmpty(editor, beforeStartMatchPoint as Point))
      return;
  }

  return {
    afterStartMatchPoint,
    beforeStartMatchPoint,
    beforeEndMatchPoint,
  };
};
