import {
  getStroke,
  getStrokeOutlinePoints,
  getStrokePoints,
} from 'perfect-freehand';

/** A point of a pen line, with its pressure from 0 to 1. */
export type PenPoint = readonly [x: number, y: number, pressure: number];

/**
 * How perfect-freehand draws a pen line: `size` is its width at half
 * pressure, `thinning` how much thinner it draws as pressure falls, and
 * `streamline` how far, from 0 to 1, it pulls the line off its points toward
 * a smoother path.
 */
export type PenShape = Readonly<{
  size: number;
  streamline: number;
  thinning: number;
}>;

const RATE_OF_PRESSURE_CHANGE = 0.275;

const round = (value: number) => Math.round(value * 100) / 100;

// curvedPathOf and simulatedPressure are adapted from perfect-freehand's README
// and its simulated pressure (MIT, Copyright (c) 2021 Stephen Ruiz Ltd).

const curvedPathOf = (outline: readonly number[][]) => {
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

const polygonPathOf = (outline: readonly number[][]) =>
  outline.length === 0
    ? ''
    : `M${outline.map(([x, y]) => `${round(x)},${round(y)}`).join('L')}Z`;

/**
 * The outline of a pen line through `points`, drawn in the given pen shape, as
 * an SVG path of curves through the midpoints of its outline points.
 * `last` draws the line's end at its last point, for a finished line.
 */
export const strokeOutline = (
  points: readonly PenPoint[],
  { size, streamline, thinning }: PenShape,
  last: boolean
) =>
  curvedPathOf(
    getStroke(
      points.map(([x, y, pressure]) => ({ pressure, x, y })),
      {
        last,
        simulatePressure: false,
        size,
        smoothing: 0.5,
        streamline,
        thinning,
      }
    )
  );

// perfect-freehand puts a lone point's twin 1 px off it on each axis and skips
// the points within 3 px of the line's end; drawn at 100 times scale, both
// shrink to hundredths of a pixel.
const POLYGON_SCALE = 100;

/**
 * The outline of a pen line through `points`, `size` wide at half pressure and
 * `thinning` thinner as pressure falls, as an SVG path of straight edges
 * around the points themselves, unsmoothed, so its fill stays within the
 * full-pressure radius, `size * (1 + thinning) / 2`, of the line through them.
 * `last` draws the line's end at its last point, for a finished line.
 */
export const strokePolygon = (
  points: readonly PenPoint[],
  { size, thinning }: Readonly<{ size: number; thinning: number }>,
  last: boolean
) =>
  polygonPathOf(
    getStrokeOutlinePoints(
      getStrokePoints(
        points.map(([x, y, pressure]) => ({
          pressure,
          x: x * POLYGON_SCALE,
          y: y * POLYGON_SCALE,
        })),
        { size: 0, streamline: 0 }
      ),
      {
        last,
        simulatePressure: false,
        size: size * POLYGON_SCALE,
        smoothing: 0,
        thinning,
      }
    ).map(([x, y]) => [x / POLYGON_SCALE, y / POLYGON_SCALE])
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
