import { Point as SlatePoint } from 'slate';

import type { At, TextDirection } from '../types';
import type { Operation } from './operation';

import { type Path, PathApi } from './path';
import { RangeApi } from './range';

export type Point = {
  /** The index of the character in the text node. */
  offset: number;
  /** The path to the text node. */
  path: Path;
};

/** Point retrieval, check and transform methods. */
export const PointApi: {
  /**
   * Compare a point to another, returning an integer indicating whether the
   * point was before, at, or after the other.
   */
  compare: (point: Point, another: Point) => -1 | 0 | 1;
  /** Check if a point is exactly equal to another. */
  equals: (point: Point, another: Point) => boolean;
  /**
   * Get the point from a location. If the location is a range, get the anchor
   * point (if `focus` is true, get the focus point). If the location is a path,
   * get the point at this path with offset 0.
   */
  get: (
    at?: At | null,
    {
      focus,
    }?: {
      focus?: boolean;
    }
  ) => Point | undefined;
  /** Check if a point is after another. */
  isAfter: (point: Point, another: Point) => boolean;
  /** Check if a point is before another. */
  isBefore: (point: Point, another: Point) => boolean;
  /** Check if a value implements the `Point` interface. */
  isPoint: (value: any) => value is Point;
  /** Transform a point by an operation. */
  transform: (
    point: Point,
    op: Operation,
    options?: PointTransformOptions
  ) => Point | null;
} = {
  ...(SlatePoint as any),
  get: (at, { focus } = {}) => {
    let point: Point | undefined;

    if (RangeApi.isRange(at)) point = focus ? at.focus : at.anchor;
    if (PointApi.isPoint(at)) point = at;
    if (PathApi.isPath(at)) point = { offset: 0, path: at };

    return point;
  },
};

export type PointEntry = [Point, 'anchor' | 'focus'];

/**
 * `PointEntry` objects are returned when iterating over `Point` objects that
 * belong to a range.
 */

export interface PointTransformOptions {
  affinity?: TextDirection | null;
}
