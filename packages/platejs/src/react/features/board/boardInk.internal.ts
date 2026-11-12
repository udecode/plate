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

/**
 * Whether board point `at` lies on the line through `ink`, or within
 * `INK_SLOP_PX` screen pixels of it at `zoom`.
 */
export const onInk = (
  ink: readonly BoardInkPoint[],
  at: BoardPlace,
  zoom: number
) => {
  const slop = INK_SLOP_PX / zoom;
  let previous: (BoardPlace & { radius: number }) | undefined;

  for (const [x, y, pressure] of ink) {
    const point = { radius: boardStrokeRadius(pressure), x, y };
    const reach = Math.max(point.radius, previous?.radius ?? 0) + slop;

    if (distanceToSegment(at, previous ?? point, point) <= reach) return true;
    previous = point;
  }

  return false;
};
