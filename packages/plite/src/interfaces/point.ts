import { type Path, PathApi } from '..';
import { getPointRoot } from '../internal/root-location';
import { isObject } from '../utils/is-object';

/**
 * `Point` objects refer to a specific location in a text node in a Plite
 * document. Its path refers to the location of the node in the tree, and its
 * offset refers to the distance into the node's string of text. Points can
 * only refer to `Text` nodes.
 */

export interface BasePoint {
  readonly offset: number;
  readonly path: Path;
  readonly root?: string;
}

export type Point = BasePoint;

export interface PointInterface {
  /**
   * Compare a point to another, returning an integer indicating whether the
   * point was before, at, or after the other.
   */
  compare: (point: Point, another: Point) => -1 | 0 | 1;

  /**
   * Check if a point is after another.
   */
  isAfter: (point: Point, another: Point) => boolean;

  /**
   * Check if a point is before another.
   */
  isBefore: (point: Point, another: Point) => boolean;

  /**
   * Check if a point is exactly equal to another.
   */
  equals: (point: Point, another: Point) => boolean;

  /**
   * Check if a value implements the `Point` interface.
   */
  isPoint: (value: unknown) => value is Point;
}

// eslint-disable-next-line no-redeclare
export const PointApi: Readonly<PointInterface> = Object.freeze({
  compare(point: Point, another: Point): -1 | 0 | 1 {
    const pointRoot = getPointRoot(point).root;
    const anotherRoot = getPointRoot(another).root;

    if (pointRoot !== anotherRoot) {
      return pointRoot < anotherRoot ? -1 : 1;
    }

    const result = PathApi.compare(point.path, another.path);

    if (result === 0) {
      if (point.offset < another.offset) return -1;
      if (point.offset > another.offset) return 1;
      return 0;
    }

    return result;
  },

  isAfter(point: Point, another: Point): boolean {
    return PointApi.compare(point, another) === 1;
  },

  isBefore(point: Point, another: Point): boolean {
    return PointApi.compare(point, another) === -1;
  },

  equals(point: Point, another: Point): boolean {
    // PERF: ensure the offsets are equal first since they are cheaper to check.
    return (
      point.offset === another.offset &&
      getPointRoot(point).root === getPointRoot(another).root &&
      PathApi.equals(point.path, another.path)
    );
  },

  isPoint(value: unknown): value is Point {
    return (
      isObject(value) &&
      typeof value.offset === 'number' &&
      (value.root === undefined || typeof value.root === 'string') &&
      PathApi.isPath(value.path)
    );
  },
});

/**
 * `PointEntry` objects are returned when iterating over `Point` objects that
 * belong to a range.
 */

export type PointEntry = readonly [Point, 'anchor' | 'focus'];
