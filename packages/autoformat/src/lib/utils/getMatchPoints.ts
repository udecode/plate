import type { Editor, Point } from '@udecode/plate';

import type { MatchRange } from '../types';

import { isPreviousCharacterEmpty } from './isPreviousCharacterEmpty';

export type GetMatchPointsReturnType =
  | {
      afterStartMatchPoint: Point | undefined;
      beforeEndMatchPoint: Point;
      beforeStartMatchPoint: Point | undefined;
    }
  | undefined;

export const getMatchPoints = (editor: Editor, { end, start }: MatchRange) => {
  const selection = editor.selection!;

  let beforeEndMatchPoint: Point | undefined = selection.anchor;

  if (end) {
    beforeEndMatchPoint = editor.api.before(selection, {
      matchString: end,
    });

    if (!beforeEndMatchPoint) return;
  }

  let afterStartMatchPoint: Point | undefined;
  let beforeStartMatchPoint: Point | undefined;

  if (start) {
    afterStartMatchPoint = editor.api.before(beforeEndMatchPoint, {
      afterMatch: true,
      matchString: start,
      skipInvalid: true,
    });

    if (!afterStartMatchPoint) return;

    beforeStartMatchPoint = editor.api.before(beforeEndMatchPoint, {
      matchString: start,
      skipInvalid: true,
    });

    if (!isPreviousCharacterEmpty(editor, beforeStartMatchPoint as Point))
      return;
  }

  return {
    afterStartMatchPoint,
    beforeEndMatchPoint,
    beforeStartMatchPoint,
  };
};
