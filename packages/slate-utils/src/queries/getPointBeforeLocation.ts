/* eslint-disable no-constant-condition */
import type { Location, Point } from 'slate';

import {
  type TEditor,
  type Value,
  getEditorString,
  getPoint,
  getPointBefore,
} from '@udecode/slate';
import castArray from 'lodash/castArray.js';
import map from 'lodash/map.js';

import { isRangeAcrossBlocks } from './isRangeAcrossBlocks';

export interface BeforeOptions {
  distance?: number | undefined;
  unit?: 'block' | 'character' | 'line' | 'offset' | 'word' | undefined;
}

export interface PointBeforeOptions extends BeforeOptions {
  /**
   * If true, get the point after the matching point. If false, get the matching
   * point.
   */
  afterMatch?: boolean;

  /** Lookup before the location until this predicate is true */
  match?: (value: {
    at: Location;
    beforePoint: Point;
    beforeString: string;
  }) => boolean;

  /** Lookup before the location for `matchString`. */
  matchString?: string | string[];

  /**
   * If true, lookup until the start of the editor value. If false, lookup until
   * the first invalid character.
   */
  skipInvalid?: boolean;
}

/**
 * {@link getPointBefore} with additional options. TODO: support for sequence of
 * any characters.
 */
export const getPointBeforeLocation = <V extends Value>(
  editor: TEditor<V>,
  at: Location,
  options?: PointBeforeOptions
) => {
  if (!options || (!options.match && !options.matchString)) {
    return getPointBefore(editor, at, options);
  }

  const unitOffset = !options.unit || options.unit === 'offset';

  const matchStrings: string[] = options.matchString
    ? castArray(options.matchString)
    : [''];

  let point: any;

  matchStrings.some((matchString) => {
    let beforeAt = at;
    let previousBeforePoint = getPoint(editor, at, { edge: 'end' });

    const stackLength = matchString.length + 1;
    const stack: any[] = Array.from({ length: stackLength });

    let count = 0;

    while (true) {
      const beforePoint = getPointBefore(editor, beforeAt, options);

      // not found
      if (!beforePoint) return;
      // stop looking outside of current block
      if (
        isRangeAcrossBlocks(editor, {
          at: {
            anchor: beforePoint,
            focus: previousBeforePoint,
          },
        })
      ) {
        return;
      }

      const beforeString = getEditorString(editor, {
        anchor: beforePoint,
        focus: previousBeforePoint,
      });

      let beforeStringToMatch = beforeString;

      if (unitOffset && stackLength) {
        stack.unshift({
          point: beforePoint,
          text: beforeString,
        });
        stack.pop();

        beforeStringToMatch = map(stack.slice(0, -1), 'text').join('');
      }
      if (
        matchString === beforeStringToMatch ||
        options.match?.({ at, beforePoint, beforeString: beforeStringToMatch })
      ) {
        if (options.afterMatch) {
          if (stackLength && unitOffset) {
            point = stack.at(-1)?.point;

            return !!point;
          }

          point = previousBeforePoint;

          return true;
        }

        point = beforePoint;

        return true;
      }

      previousBeforePoint = beforePoint;
      beforeAt = beforePoint;

      count += 1;

      if (!options.skipInvalid && (!matchString || count >= matchString.length))
        return;
    }
  });

  return point;
};
