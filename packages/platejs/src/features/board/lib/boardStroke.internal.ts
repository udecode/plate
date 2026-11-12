import type { BoardPlace, BoardSize } from './boardShape.internal';

export const BOARD_STROKE_TYPE = 'boardStroke';

/**
 * The `size` perfect-freehand draws a pen line at, in board units: the line's
 * width at half pressure.
 */
export const BOARD_STROKE_WIDTH = 8;

/** How much thinner perfect-freehand draws a pen line as its pressure falls. */
export const BOARD_STROKE_THINNING = 0.5;

/** perfect-freehand's radius of a pen line at a point of `pressure`. */
export const boardStrokeRadius = (pressure: number) =>
  BOARD_STROKE_WIDTH * (0.5 - BOARD_STROKE_THINNING * (0.5 - pressure));

/**
 * How far a pen line reaches past its points at full pressure, and so how far
 * a stroke's box reaches past them on each side.
 */
export const BOARD_STROKE_REACH = boardStrokeRadius(1);

/**
 * A stroke's stored `points`: flat `[x, y, pressure]` triples, each number in
 * [0, 1], with `x` and `y` fractions of the stroke's box inset by
 * `BOARD_STROKE_REACH`, or by half a side shorter than twice that.
 */
export type BoardStrokePoints = readonly number[];

/** A point of a pen line in board coordinates, with its pressure from 0 to 1. */
export type BoardInkPoint = readonly [x: number, y: number, pressure: number];

export const isBoardStrokePoints = (
  value: unknown
): value is BoardStrokePoints =>
  Array.isArray(value) &&
  value.length > 0 &&
  value.length % 3 === 0 &&
  value.every(
    (item) =>
      typeof item === 'number' &&
      Number.isFinite(item) &&
      item >= 0 &&
      item <= 1
  );

// A box narrower than twice the reach keeps its line on its middle.
const insetOf = (length: number) => Math.min(BOARD_STROKE_REACH, length / 2);

/** Where a stroke's stored `points` draw in `box`, as board points. */
export const boardInkIn = (
  points: BoardStrokePoints,
  box: BoardPlace & BoardSize
) => {
  const x = insetOf(box.width);
  const y = insetOf(box.height);
  const ink: BoardInkPoint[] = [];

  for (let at = 0; at < points.length; at += 3) {
    ink.push([
      box.x + x + points[at] * (box.width - 2 * x),
      box.y + y + points[at + 1] * (box.height - 2 * y),
      points[at + 2],
    ]);
  }

  return ink;
};
