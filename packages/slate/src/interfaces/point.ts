import { Point as SlatePoint } from 'slate';

import type { TextDirection } from '../types';
import type { Operation } from './operation';
import type { Path } from './path';

export type Point = {
  /** The index of the character in the text node. */
  offset: number;
  /** The path to the text node. */
  path: Path;
};

/** Point retrieval, check and transform methods. */
export const PointApi: {
  /** Transform a point by an operation. */
  transform: (
    point: Point,
    op: Operation,
    options?: PointTransformOptions
  ) => Point | null;

  /**
   * Compare a point to another, returning an integer indicating whether the
   * point was before, at, or after the other.
   */
  compare: (point: Point, another: Point) => -1 | 0 | 1;

  /** Check if a point is exactly equal to another. */
  equals: (point: Point, another: Point) => boolean;

  /** Check if a point is after another. */
  isAfter: (point: Point, another: Point) => boolean;

  /** Check if a point is before another. */
  isBefore: (point: Point, another: Point) => boolean;

  /** Check if a value implements the `Point` interface. */
  isPoint: (value: any) => value is Point;
} = SlatePoint as any;

export interface PointTransformOptions {
  affinity?: TextDirection | null;
}

/**
 * `PointEntry` objects are returned when iterating over `Point` objects that
 * belong to a range.
 */

export type PointEntry = [Point, 'anchor' | 'focus'];
