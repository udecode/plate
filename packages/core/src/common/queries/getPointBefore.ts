/* eslint-disable no-constant-condition */
import castArray from 'lodash/castArray';
import map from 'lodash/map';
import { Editor, Location, Path, Point } from 'slate';
import {TEditor} from "../../types/slate/TEditor";
 
export interface BeforeOptions {
  distance?: number | undefined;
  unit?: 'character' | 'word' | 'line' | 'block' | 'offset' | undefined;
}

export interface PointBeforeOptions extends BeforeOptions {
  /**
   * Lookup before the location for `matchString`.
   */
  matchString?: string | string[];

  /**
   * Lookup before the location until this predicate is true
   */
  match?: (value: {
    beforeString: string;
    beforePoint: Point;
    at: Location;
  }) => boolean;

  /**
   * If true, get the point after the matching point.
   * If false, get the matching point.
   */
  afterMatch?: boolean;

  /**
   * If true, lookup until the start of the editor value.
   * If false, lookup until the first invalid character.
   */
  skipInvalid?: boolean;

  /**
   * Allow lookup across multiple node paths.
   */
  multiPaths?: boolean;
}

/**
 * {@link Editor.before} with additional options.
 * TODO: support for sequence of any characters.
 */
export const getPointBefore = (
  editor: TEditor,
  at: Location,
  options?: PointBeforeOptions
) => {
  if (!options || (!options.match && !options.matchString)) {
    return Editor.before(editor, at, options);
  }

  const unitOffset = !options.unit || options.unit === 'offset';

  const matchStrings: string[] = options.matchString
    ? castArray(options.matchString)
    : [''];

  let point: any;

  matchStrings.some((matchString) => {
    let beforeAt = at;
    let previousBeforePoint = Editor.point(editor, at, { edge: 'end' });

    const stackLength = matchString.length + 1;
    const stack = Array(stackLength);

    let count = 0;

    while (true) {
      const beforePoint = Editor.before(editor, beforeAt, options);

      // not found
      if (!beforePoint) return;

      // different path
      if (
        !options.multiPaths &&
        !Path.equals(beforePoint.path, previousBeforePoint.path)
      ) {
        return;
      }

      const beforeString = Editor.string(editor, {
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
        options.match?.({ beforeString: beforeStringToMatch, beforePoint, at })
      ) {
        if (options.afterMatch) {
          if (stackLength && unitOffset) {
            point = stack[stack.length - 1]?.point;
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

      if (!options.skipInvalid) {
        if (!matchString || count > matchString.length) return;
      }
    }
  });

  return point;
};
