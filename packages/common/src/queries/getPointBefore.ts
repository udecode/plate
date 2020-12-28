/* eslint-disable no-constant-condition */
import castArray from 'lodash/castArray';
import map from 'lodash/map';
import { Editor, Location, Path, Point } from 'slate';

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
  editor: Editor,
  at: Location,
  options?: PointBeforeOptions
) => {
  if (!options || (!options.match && !options.matchString)) {
    return Editor.before(editor, at, options);
  }

  let beforeAt = at;
  let previousBeforePoint = Editor.point(editor, at, { edge: 'end' });

  const stackLength = (options.matchString?.length || 0) + 1;
  const stack = Array(stackLength);

  const unitOffset = !options.unit || options.unit === 'offset';

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

    const matchString: string[] = castArray(options.matchString);

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
      matchString.includes(beforeStringToMatch) ||
      options.match?.({ beforeString: beforeStringToMatch, beforePoint, at })
    ) {
      if (options.afterMatch) {
        if (stackLength && unitOffset) {
          return stack[stack.length - 1]?.point;
        }
        return previousBeforePoint;
      }
      return beforePoint;
    }

    previousBeforePoint = beforePoint;
    beforeAt = beforePoint;

    count += 1;

    if (!options.skipInvalid) {
      if (!matchString || count > matchString.length) return;
    }
  }
};
