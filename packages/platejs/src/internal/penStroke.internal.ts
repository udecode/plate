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

const polygonPathOf = (outline: ReadonlyArray<readonly number[]>) =>
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

const unscaled = (outline: readonly number[][]) =>
  outline.map(([x, y]) => [x / POLYGON_SCALE, y / POLYGON_SCALE] as const);

/**
 * The outline of a pen line through `points`, `size` wide at half pressure and
 * `thinning` thinner as pressure falls, as an SVG path of straight edges
 * around the points themselves, unsmoothed, so its fill stays within the
 * full-pressure radius, `size * (1 + thinning) / 2`, of the line through them.
 * `last` draws the line's end at its last point, for a finished line.
 */
export const strokePolygon = (
  points: readonly PenPoint[],
  shape: Readonly<{ size: number; thinning: number }>,
  last: boolean
) => polygonPathOf(strokePolygonPoints(points, shape, last));

export const strokePolygonPoints = (
  points: readonly PenPoint[],
  { size, thinning }: Readonly<{ size: number; thinning: number }>,
  last: boolean
) =>
  unscaled(
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

type Place = Readonly<{ x: number; y: number }>;

const distanceToSegment = (at: Place, from: Place, to: Place) => {
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
export const lineSide = (from: Place, to: Place, at: Place) =>
  (to.x - from.x) * (at.y - from.y) - (to.y - from.y) * (at.x - from.x);

const crosses = (a: Place, b: Place, c: Place, d: Place) =>
  lineSide(c, d, a) * lineSide(c, d, b) < 0 &&
  lineSide(a, b, c) * lineSide(a, b, d) < 0;

/** The shortest distance between the segments `from`-`to` and `start`-`end`. */
export const segmentGap = (from: Place, to: Place, start: Place, end: Place) =>
  crosses(from, to, start, end)
    ? 0
    : Math.min(
        distanceToSegment(from, start, end),
        distanceToSegment(to, start, end),
        distanceToSegment(start, from, to),
        distanceToSegment(end, from, to)
      );

/** Whether `polygon` winds around `at`, by the nonzero rule SVG fills with. */
export const windsAround = (polygon: readonly Place[], at: Place) => {
  let winding = 0;

  for (const [index, from] of polygon.entries()) {
    const to = polygon[(index + 1) % polygon.length];
    const side = lineSide(from, to, at);

    if (from.y <= at.y && to.y > at.y && side > 0) winding += 1;
    if (from.y > at.y && to.y <= at.y && side < 0) winding -= 1;
  }

  return winding !== 0;
};
