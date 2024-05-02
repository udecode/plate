import type { TEditor, Value } from '@udecode/slate';

import { type Location, Path, Point, Range } from 'slate';

/**
 * Get the point from a location (default: selection). If the location is a
 * range, get the anchor point. If the location is a path, get the point at this
 * path with offset 0. If `focus` is true, get the focus point.
 */
export const getPointFromLocation = <V extends Value>(
  editor: TEditor<V>,
  {
    at = editor.selection,
    focus,
  }: {
    at?: Location | null;
    focus?: boolean;
  } = {}
) => {
  let point: Point | undefined;

  if (Range.isRange(at)) point = focus ? at.focus : at.anchor;
  if (Point.isPoint(at)) point = at;
  if (Path.isPath(at)) point = { offset: 0, path: at };

  return point;
};
