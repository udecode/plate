import { Editor, Location, Range } from 'slate';
import { getPointBefore, PointBeforeOptions } from './getPointBefore';

export interface RangeBeforeOptions extends PointBeforeOptions {}

/**
 * Get range from {@link getPointBefore} to the end point of `at`.
 */
export const getRangeBefore = (
  editor: Editor,
  at: Location,
  options?: RangeBeforeOptions
): Range | undefined => {
  const anchor = getPointBefore(editor, at, options);
  if (!anchor) return;

  const focus = Editor.point(editor, at, { edge: 'end' });

  return {
    anchor,
    focus,
  };
};
