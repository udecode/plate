import { getStroke } from 'perfect-freehand';

/** A point of a pen line, with its pressure from 0 to 1. */
export type PenPoint = readonly [x: number, y: number, pressure: number];

/**
 * How perfect-freehand draws a pen line: `size` is its width at half
 * pressure, and `thinning` how much thinner it draws as pressure falls.
 */
export type PenShape = Readonly<{ size: number; thinning: number }>;

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
 * The outline of a pen line through `points`, drawn in the given pen shape, as
 * an SVG path.
 * `last` draws the line's end at its last point, for a finished line.
 */
export const strokeOutline = (
  points: readonly PenPoint[],
  { size, thinning }: PenShape,
  last: boolean
) =>
  pathOf(
    getStroke(
      points.map(([x, y, pressure]) => ({ pressure, x, y })),
      {
        last,
        simulatePressure: false,
        size,
        smoothing: 0.5,
        streamline: 0.5,
        thinning,
      }
    )
  );

/**
 * The pressure a mouse or touch line of width `size` takes at a point
 * `distance` past the last, from the `previous` point's: it eases thinner as
 * the line speeds up and thicker as it slows.
 */
export const simulatedPressure = (
  previous: number,
  distance: number,
  size: number
) => {
  const speed = Math.min(1, distance / size);

  return Math.min(
    1,
    previous +
      (Math.min(1, 1 - speed) - previous) * speed * RATE_OF_PRESSURE_CHANGE
  );
};
