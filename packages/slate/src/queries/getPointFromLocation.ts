import { Path, Point, Range } from 'slate';

import type { At } from '../types/index';

/**
 * Get the point from a location. If the location is a range, get the anchor
 * point. If the location is a path, get the point at this path with offset 0.
 * If `focus` is true, get the focus point.
 */
export const getPointFromLocation = ({
  at,
  focus,
}: {
  at?: At | null;
  focus?: boolean;
} = {}) => {
  let point: Point | undefined;

  if (Range.isRange(at)) point = focus ? at.focus : at.anchor;
  if (Point.isPoint(at)) point = at;
  if (Path.isPath(at)) point = { offset: 0, path: at };

  return point;
};
