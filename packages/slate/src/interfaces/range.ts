import {
  type Location,
  LocationApi,
  type Operation,
  PathApi,
  type Point,
  PointApi,
  type PointEntry,
} from '..';
import type { RangeDirection } from '../types/types';
import { isObject } from '../utils/is-object';

/**
 * `Range` objects are a set of points that refer to a specific span of a Slate
 * document. They can define a span inside a single node or a can span across
 * multiple nodes.
 */

export interface BaseRange {
  anchor: Point;
  focus: Point;
}

export type Range = BaseRange;

export interface RangeEdgesOptions {
  reverse?: boolean;
}

export interface RangeTransformOptions {
  affinity?: RangeDirection | null;
}

export interface RangeInterface {
  /**
   * Get the start and end points of a range, in the order in which they appear
   * in the document.
   */
  edges: (range: Range, options?: RangeEdgesOptions) => [Point, Point];

  /**
   * Get the end point of a range.
   */
  end: (range: Range) => Point;

  /**
   * Check if a range is exactly equal to another.
   */
  equals: (range: Range, another: Range) => boolean;

  /**
   * Check if a range includes a path, a point or part of another range.
   */
  includes: (range: Range, target: Location) => boolean;

  /**
   * Check if a range includes another range.
   */
  surrounds: (range: Range, target: Range) => boolean;

  /**
   * Get the intersection of a range with another.
   */
  intersection: (range: Range, another: Range) => Range | null;

  /**
   * Check if a range is backward, meaning that its anchor point appears in the
   * document _after_ its focus point.
   */
  isBackward: (range: Range) => boolean;

  /**
   * Check if a range is collapsed, meaning that both its anchor and focus
   * points refer to the exact same position in the document.
   */
  isCollapsed: (range: Range) => boolean;

  /**
   * Check if a range is expanded.
   *
   * This is the opposite of [[RangeApi.isCollapsed]] and is provided for legibility.
   */
  isExpanded: (range: Range) => boolean;

  /**
   * Check if a range is forward.
   *
   * This is the opposite of [[RangeApi.isBackward]] and is provided for legibility.
   */
  isForward: (range: Range) => boolean;

  /**
   * Check if a value implements the [[Range]] interface.
   */
  isRange: (value: unknown) => value is Range;

  /**
   * Iterate through all of the point entries in a range.
   */
  points: (range: Range) => Generator<PointEntry, void, undefined>;

  /**
   * Get the start point of a range.
   */
  start: (range: Range) => Point;

  /**
   * Transform a range by an operation.
   */
  transform: (
    range: Range,
    op: Operation,
    options?: RangeTransformOptions
  ) => Range | null;
}

// eslint-disable-next-line no-redeclare
export const RangeApi: RangeInterface = {
  edges(range: Range, options: RangeEdgesOptions = {}): [Point, Point] {
    const { reverse = false } = options;
    const { anchor, focus } = range;
    return RangeApi.isBackward(range) === reverse
      ? [anchor, focus]
      : [focus, anchor];
  },

  end(range: Range): Point {
    const [, end] = RangeApi.edges(range);
    return end;
  },

  equals(range: Range, another: Range): boolean {
    return (
      PointApi.equals(range.anchor, another.anchor) &&
      PointApi.equals(range.focus, another.focus)
    );
  },

  surrounds(range: Range, target: Range): boolean {
    const intersectionRange = RangeApi.intersection(range, target);
    if (!intersectionRange) {
      return false;
    }
    return RangeApi.equals(intersectionRange, target);
  },

  includes(range: Range, target: Location): boolean {
    if (LocationApi.isRange(target)) {
      if (
        RangeApi.includes(range, target.anchor) ||
        RangeApi.includes(range, target.focus)
      ) {
        return true;
      }

      const [rs, re] = RangeApi.edges(range);
      const [ts, te] = RangeApi.edges(target);
      return PointApi.isBefore(rs, ts) && PointApi.isAfter(re, te);
    }

    const [start, end] = RangeApi.edges(range);
    let isAfterStart = false;
    let isBeforeEnd = false;

    if (LocationApi.isPoint(target)) {
      isAfterStart = PointApi.compare(target, start) >= 0;
      isBeforeEnd = PointApi.compare(target, end) <= 0;
    } else {
      isAfterStart = PathApi.compare(target, start.path) >= 0;
      isBeforeEnd = PathApi.compare(target, end.path) <= 0;
    }

    return isAfterStart && isBeforeEnd;
  },

  intersection(range: Range, another: Range): Range | null {
    const { anchor, focus, ...rest } = range;
    const [s1, e1] = RangeApi.edges(range);
    const [s2, e2] = RangeApi.edges(another);
    const start = PointApi.isBefore(s1, s2) ? s2 : s1;
    const end = PointApi.isBefore(e1, e2) ? e1 : e2;

    if (PointApi.isBefore(end, start)) {
      return null;
    }
    return { anchor: start, focus: end, ...rest };
  },

  isBackward(range: Range): boolean {
    const { anchor, focus } = range;
    return PointApi.isAfter(anchor, focus);
  },

  isCollapsed(range: Range): boolean {
    const { anchor, focus } = range;
    return PointApi.equals(anchor, focus);
  },

  isExpanded(range: Range): boolean {
    return !RangeApi.isCollapsed(range);
  },

  isForward(range: Range): boolean {
    return !RangeApi.isBackward(range);
  },

  isRange(value: unknown): value is Range {
    return (
      isObject(value) &&
      PointApi.isPoint(value.anchor) &&
      PointApi.isPoint(value.focus)
    );
  },

  *points(range: Range): Generator<PointEntry, void, undefined> {
    yield [range.anchor, 'anchor'];
    yield [range.focus, 'focus'];
  },

  start(range: Range): Point {
    const [start] = RangeApi.edges(range);
    return start;
  },

  transform(
    range: Range | null,
    op: Operation,
    options: RangeTransformOptions = {}
  ): Range | null {
    if (range === null) {
      return null;
    }

    const { affinity = 'inward' } = options;
    let affinityAnchor: 'forward' | 'backward' | null;
    let affinityFocus: 'forward' | 'backward' | null;

    if (affinity === 'inward') {
      // If the range is collapsed, make sure to use the same affinity to
      // avoid the two points passing each other and expanding in the opposite
      // direction
      const isCollapsed = RangeApi.isCollapsed(range);
      if (RangeApi.isForward(range)) {
        affinityAnchor = 'forward';
        affinityFocus = isCollapsed ? affinityAnchor : 'backward';
      } else {
        affinityAnchor = 'backward';
        affinityFocus = isCollapsed ? affinityAnchor : 'forward';
      }
    } else if (affinity === 'outward') {
      if (RangeApi.isForward(range)) {
        affinityAnchor = 'backward';
        affinityFocus = 'forward';
      } else {
        affinityAnchor = 'forward';
        affinityFocus = 'backward';
      }
    } else {
      affinityAnchor = affinity;
      affinityFocus = affinity;
    }
    const anchor = PointApi.transform(range.anchor, op, {
      affinity: affinityAnchor,
    });
    const focus = PointApi.transform(range.focus, op, {
      affinity: affinityFocus,
    });

    if (!anchor || !focus) {
      return null;
    }

    return { anchor, focus };
  },
};
