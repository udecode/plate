/* eslint-disable no-constant-condition */
import { Editor, Location, Point } from 'slate';

export interface BeforeOptions {
  distance?: number | undefined;
  unit?: 'character' | 'word' | 'line' | 'block' | 'offset' | undefined;
}

export interface PointBeforeOptions extends BeforeOptions {
  /**
   * Look before the location until it matches this string
   */
  matchString?: string;

  /**
   * Look before the location until this predicate is true
   */
  match?: (value: {
    beforeString: string;
    beforePoint: Point;
    at: Location;
  }) => boolean;

  /**
   * Get point before the match
   */
  beforeMatch?: boolean;
}

/**
 * {@link Editor.before} with additional options.
 */
export const getPointBefore = (
  editor: Editor,
  at: Location | null,
  options?: PointBeforeOptions
) => {
  if (!at) return;

  if (!options || (!options.match && !options.matchString)) {
    return Editor.before(editor, at, options);
  }

  let beforeAt = at;
  let previousBeforePoint = Editor.point(editor, at, { edge: 'end' });

  while (true) {
    const beforePoint = Editor.before(editor, beforeAt, options);

    // not found
    if (!beforePoint) return;

    const beforeString = Editor.string(editor, {
      anchor: beforePoint,
      focus: previousBeforePoint,
    });

    if (
      options.matchString === beforeString ||
      options.match?.({ beforeString, beforePoint, at })
    ) {
      if (options.beforeMatch) {
        return beforePoint;
      }
      return previousBeforePoint;
    }

    previousBeforePoint = beforePoint;
    beforeAt = beforePoint;
  }
};
