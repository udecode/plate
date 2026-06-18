import { type Operation, type Path, PathApi } from '..';
import { getOperationRoot, getPointRoot } from '../internal/root-location';
import type { TextDirection } from '../types/types';
import { isObject } from '../utils/is-object';

/**
 * `Point` objects refer to a specific location in a text node in a Slate
 * document. Its path refers to the location of the node in the tree, and its
 * offset refers to the distance into the node's string of text. Points can
 * only refer to `Text` nodes.
 */

export interface BasePoint {
  path: Path;
  offset: number;
  root?: string;
}

export type Point = BasePoint;

export interface PointTransformOptions {
  affinity?: TextDirection | null;
}

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

  /**
   * Transform a point by an operation.
   */
  transform: (
    point: Point,
    op: Operation,
    options?: PointTransformOptions
  ) => Point | null;
}

// eslint-disable-next-line no-redeclare
export const PointApi: PointInterface = {
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

  transform(
    point: Point | null,
    op: Operation,
    options: PointTransformOptions = {}
  ): Point | null {
    if (point === null) {
      return null;
    }

    const { affinity = 'forward' } = options;
    let { path, offset } = point;

    if (getPointRoot(point).root !== getOperationRoot(op)) {
      return point;
    }

    switch (op.type) {
      case 'insert_node':
      case 'move_node': {
        path = PathApi.transform(path, op, options)!;
        break;
      }

      case 'insert_text': {
        if (
          PathApi.equals(op.path, path) &&
          (op.offset < offset ||
            (op.offset === offset && affinity === 'forward'))
        ) {
          offset += op.text.length;
        }

        break;
      }

      case 'merge_node': {
        if (PathApi.equals(op.path, path)) {
          offset += op.position;
        }

        path = PathApi.transform(path, op, options)!;
        break;
      }

      case 'remove_text': {
        if (PathApi.equals(op.path, path) && op.offset <= offset) {
          offset -= Math.min(offset - op.offset, op.text.length);
        }

        break;
      }

      case 'remove_node': {
        if (
          PathApi.equals(op.path, path) ||
          PathApi.isAncestor(op.path, path)
        ) {
          return null;
        }

        path = PathApi.transform(path, op, options)!;
        break;
      }

      case 'replace_fragment': {
        if (
          PathApi.equals(op.path, path) ||
          PathApi.isAncestor(op.path, path)
        ) {
          return null;
        }

        path = PathApi.transform(path, op, options)!;
        break;
      }

      case 'replace_children': {
        const nextPath = PathApi.transform(path, op, options);

        if (!nextPath) {
          return null;
        }

        path = nextPath;
        break;
      }

      case 'split_node': {
        if (PathApi.equals(op.path, path)) {
          if (op.position === offset && affinity == null) {
            return null;
          }
          if (
            op.position < offset ||
            (op.position === offset && affinity === 'forward')
          ) {
            offset -= op.position;

            path = PathApi.transform(path, op, {
              ...options,
              affinity: 'forward',
            })!;
          }
        } else {
          path = PathApi.transform(path, op, options)!;
        }

        break;
      }

      default:
        return point;
    }

    return { ...point, path, offset };
  },
};

/**
 * `PointEntry` objects are returned when iterating over `Point` objects that
 * belong to a range.
 */

export type PointEntry = [Point, 'anchor' | 'focus'];
