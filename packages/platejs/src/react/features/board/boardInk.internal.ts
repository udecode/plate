import { getStroke } from 'perfect-freehand';

import type { BoardPlace } from '../../../features/board/lib';
import {
  BOARD_STROKE_THINNING,
  BOARD_STROKE_WIDTH,
  type BoardInkPoint,
  boardStrokeRadius,
} from '../../../features/board/lib/boardStroke.internal';

/** Where a stroke draws: an SVG path over a box of `width` by `height`. */
export type BoardStrokePath = Readonly<{
  height: number;
  path: string;
  width: number;
}>;

/** How many screen pixels past its line a press still reaches a stroke. */
export const INK_SLOP_PX = 6;

const RATE_OF_PRESSURE_CHANGE = 0.275;

const round = (value: number) => Math.round(value * 100) / 100;

// pathOf and simulatedPressure are adapted from perfect-freehand's README and
// its simulated pressure (MIT, Copyright (c) 2021 Stephen Ruiz Ltd).

const pathOf = (outline: readonly number[][]) => {
  const [first] = outline;

  if (!first) return '';

  let path = `M${round(first[0])},${round(first[1])}Q`;

  for (let at = 0; at < outline.length - 1; at++) {
    const [ax, ay] = outline[at];
    const [bx, by] = outline[at + 1];

    path += `${round(ax)},${round(ay)} ${round((ax + bx) / 2)},${round(
      (ay + by) / 2
    )} `;
  }

  return `${path}Z`;
};

/**
 * The outline of a pen line through `ink`, as an SVG path. `last` draws the
 * line's end at its last point, for a finished line.
 */
export const strokeOutline = (ink: readonly BoardInkPoint[], last: boolean) =>
  pathOf(
    getStroke(
      ink.map(([x, y, pressure]) => ({ pressure, x, y })),
      {
        last,
        simulatePressure: false,
        size: BOARD_STROKE_WIDTH,
        smoothing: 0.5,
        streamline: 0.5,
        thinning: BOARD_STROKE_THINNING,
      }
    )
  );

/**
 * The pressure a mouse or touch line takes at a point `distance` board units
 * past the last, from the `previous` point's: it eases thinner as the line
 * speeds up and thicker as it slows.
 */
export const simulatedPressure = (previous: number, distance: number) => {
  const speed = Math.min(1, distance / BOARD_STROKE_WIDTH);

  return Math.min(
    1,
    previous +
      (Math.min(1, 1 - speed) - previous) * speed * RATE_OF_PRESSURE_CHANGE
  );
};

const distanceToSegment = (
  at: BoardPlace,
  from: BoardPlace,
  to: BoardPlace
) => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = dx * dx + dy * dy;
  const along =
    length === 0
      ? 0
      : Math.min(
          1,
          Math.max(0, ((at.x - from.x) * dx + (at.y - from.y) * dy) / length)
        );

  return Math.hypot(at.x - from.x - along * dx, at.y - from.y - along * dy);
};

/** Which side of the line from `from` to `to` the point `at` lies on, by sign. */
export const lineSide = (from: BoardPlace, to: BoardPlace, at: BoardPlace) =>
  (to.x - from.x) * (at.y - from.y) - (to.y - from.y) * (at.x - from.x);

const crosses = (a: BoardPlace, b: BoardPlace, c: BoardPlace, d: BoardPlace) =>
  lineSide(c, d, a) * lineSide(c, d, b) < 0 &&
  lineSide(a, b, c) * lineSide(a, b, d) < 0;

/** The shortest distance between the segments `from`-`to` and `start`-`end`. */
export const segmentGap = (
  from: BoardPlace,
  to: BoardPlace,
  start: BoardPlace,
  end: BoardPlace
) =>
  crosses(from, to, start, end)
    ? 0
    : Math.min(
        distanceToSegment(from, start, end),
        distanceToSegment(to, start, end),
        distanceToSegment(start, from, to),
        distanceToSegment(end, from, to)
      );

/**
 * Whether the segment from board point `from` to `to` passes over the line
 * through `ink`, or within `INK_SLOP_PX` screen pixels of it at `zoom`. A
 * press passes its point as both `from` and `to`.
 */
export const onInk = (
  ink: readonly BoardInkPoint[],
  from: BoardPlace,
  to: BoardPlace,
  zoom: number
) => {
  const slop = INK_SLOP_PX / zoom;
  const minX = Math.min(from.x, to.x);
  const maxX = Math.max(from.x, to.x);
  const minY = Math.min(from.y, to.y);
  const maxY = Math.max(from.y, to.y);
  let previous: (BoardPlace & { radius: number }) | undefined;

  for (const [x, y, pressure] of ink) {
    const point = { radius: boardStrokeRadius(pressure), x, y };
    const start = previous ?? point;
    const reach = Math.max(point.radius, start.radius) + slop;

    previous = point;
    if (
      Math.min(start.x, x) - reach > maxX ||
      Math.max(start.x, x) + reach < minX ||
      Math.min(start.y, y) - reach > maxY ||
      Math.max(start.y, y) + reach < minY
    ) {
      continue;
    }
    if (segmentGap(from, to, start, point) <= reach) return true;
  }

  return false;
};
